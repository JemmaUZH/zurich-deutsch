import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import { useI18n, quizTypeLabel } from '../i18n.jsx';
import {
  speak,
  stopSpeech,
  detectTtsEngines,
  getEnginePref,
  setEnginePref,
  engineLabel,
} from '../speech.js';
import { tokenize, normalizeWord, buildVocabMap, lookupToken } from '../utils.js';

/* ---------- sentence splitting ---------- */

function splitSentences(paragraphs) {
  const out = [];
  paragraphs.forEach((text, pIdx) => {
    const parts = text.match(/[^.!?]+[.!?]+»?,?|[^.!?]+$/g) || [text];
    parts.forEach((s) => out.push({ text: s.trim(), pIdx, index: out.length }));
  });
  return out;
}

function buildSentenceTokens(sentenceText, { wordMap, phraseMap }) {
  const raw = tokenize(sentenceText);
  const out = [];
  for (let i = 0; i < raw.length; i += 1) {
    const t = raw[i];
    if (t.type !== 'word') {
      out.push({ type: 'punct', value: t.value, spaceAfter: t.spaceAfter });
      continue;
    }
    const n1 = normalizeWord(t.value);
    const next = raw[i + 1];
    if (next && next.type === 'word') {
      const phrase = phraseMap.get(`${n1} ${normalizeWord(next.value)}`);
      if (phrase) {
        out.push({
          type: 'word',
          value: `${t.value} ${next.value}`,
          entry: phrase,
          isPhrase: true,
          spaceAfter: next.spaceAfter,
        });
        i += 1;
        continue;
      }
    }
    out.push({
      type: 'word',
      value: t.value,
      entry: lookupToken(n1, { wordMap, phraseMap }),
      spaceAfter: t.spaceAfter,
    });
  }
  return out;
}

/* ---------- Quiz ---------- */

function Quiz({ lesson, onFinished }) {
  const notify = useToast();
  const { lang, t } = useI18n();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(null);

  const quiz = lesson.quiz;
  const q = quiz[qIndex];
  const total = quiz.length;

  const answer = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIndex + 1 >= total) {
      finish();
    } else {
      setQIndex((n) => n + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const finish = async () => {
    setFinished(true);
    try {
      const res = await api(`/lessons/${lesson.id}/quiz-result`, {
        method: 'POST',
        body: JSON.stringify({ score, total }),
      });
      setBest(res.bestScore);
      onFinished?.();
    } catch {
      notify(t('saveFailed'));
    }
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setBest(null);
  };

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="quiz-question quiz-result">
        <div className="score">{score}/{total}</div>
        <div className="score-label">
          {pct >= 80 ? t('resultGreat') : pct >= 50 ? t('resultGood') : t('resultKeep')}
          {best != null && <div>{t('bestScoreLabel', { n: best })}</div>}
        </div>
        <button className="btn btn-primary" onClick={restart}>{t('tryAgain')}</button>
      </div>
    );
  }

  return (
    <div className="quiz-question">
      <div className="quiz-progress-bar">
        <div style={{ width: `${((answered ? qIndex + 1 : qIndex) / total) * 100}%` }} />
      </div>
      <div className="quiz-q-meta">
        <span className="quiz-type-badge">{quizTypeLabel(q.type, lang)}</span>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>
          {t('questionNum', { n: qIndex + 1, total })}
        </span>
      </div>
      <h3>{q.question}</h3>
      {q.options.map((opt, i) => {
        let cls = 'quiz-option';
        if (answered) {
          if (i === q.correct) cls += ' correct';
          else if (i === selected) cls += ' wrong';
        }
        return (
          <button key={i} className={cls} disabled={answered} onClick={() => answer(i)}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        );
      })}
      {answered && (
        <>
          <div className={`quiz-feedback ${selected === q.correct ? 'ok' : 'no'}`}>
            <b>
              {selected === q.correct
                ? t('correct')
                : t('correctAnswer', { letter: String.fromCharCode(65 + q.correct) })}
            </b>
            <br />
            {lang === 'en' ? q.explanationEn || q.explanation : q.explanation}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={next}>
            {qIndex + 1 >= total ? t('seeResult') : t('nextQuestion')}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Lesson page ---------- */

export default function Lesson() {
  const { id } = useParams();
  const notify = useToast();
  const { lang, t } = useI18n();
  const [lesson, setLesson] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const [popover, setPopover] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [rate, setRate] = useState(1);
  const [markedComplete, setMarkedComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enginePref, setEnginePrefState] = useState(getEnginePref());
  const [engineStatus, setEngineStatus] = useState({ edge: false, openai: false });

  const playingRef = useRef(false);
  const rateRef = useRef(1);
  rateRef.current = rate;

  useEffect(() => {
    detectTtsEngines().then(setEngineStatus);
    api(`/lessons/${id}`)
      .then((data) => {
        setLesson(data);
        setSavedSet(new Set(data.savedLemmas));
        setMarkedComplete(Boolean(data.progress?.completed_at));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    return () => stopPlayback();
  }, [id]);

  const sentences = useMemo(
    () => (lesson ? splitSentences(lesson.content) : []),
    [lesson]
  );

  const { wordMap, phraseMap } = useMemo(
    () => (lesson ? buildVocabMap(lesson.vocab) : { wordMap: new Map(), phraseMap: new Map() }),
    [lesson]
  );

  const sentenceTokens = useMemo(
    () => sentences.map((s) => buildSentenceTokens(s.text, { wordMap, phraseMap })),
    [sentences, wordMap, phraseMap]
  );

  const stopPlayback = () => {
    playingRef.current = false;
    stopSpeech();
    setPlayingIndex(null);
  };

  const playFrom = (index) => {
    stopSpeech();
    playingRef.current = true;
    setPlayingIndex(index);
    speak(sentences[index].text, {
      rate: rateRef.current,
      onEnd: () => {
        if (!playingRef.current) return;
        if (index + 1 < sentences.length) {
          playFrom(index + 1);
        } else {
          playingRef.current = false;
          setPlayingIndex(null);
        }
      },
    });
  };

  const openPopover = (e, token) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = 340;
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - w / 2, window.innerWidth - w - 16));
    const below = rect.bottom + 10;
    const popHeight = 260;
    const above = rect.top - popHeight - 10 > 8;
    setPopover({
      x: left,
      y: above ? rect.top - popHeight - 10 : below,
      token,
    });
  };

  const saveWord = async (token) => {
    if (!lesson) return;
    try {
      await api('/vocab', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: lesson.id,
          lemma: token.entry?.lemma || token.value,
          lang,
        }),
      });
      const key = (token.entry?.lemma || token.value).toLowerCase();
      setSavedSet((prev) => new Set(prev).add(key));
      notify(t('savedToast'));
    } catch (err) {
      notify(err.message);
    }
  };

  const isSaved = (token) =>
    savedSet.has((token.entry?.lemma || token.value).toLowerCase());

  const paragraphSentences = lesson
    ? lesson.content.map((_, pIdx) => sentences.filter((s) => s.pIdx === pIdx))
    : [];

  const markComplete = async () => {
    try {
      await api(`/lessons/${lesson.id}/complete`, { method: 'POST' });
      setMarkedComplete(true);
      notify(t('completeToast'));
    } catch (err) {
      notify(err.message);
    }
  };

  if (loading) return <div className="spinner">加载中…</div>;
  if (error) return <div className="page"><div className="empty">{error}</div></div>;

  return (
    <div className="page page-narrow">
      <Link to="/" style={{ fontSize: 14 }}>{t('back')}</Link>

      <div className="reader">
        <h1>{lesson.emoji} {lesson.title}</h1>
        <div className="reader-sub">
          <span className={`level-badge level-${lesson.level}`}>{lesson.level}</span>
          <span>{lesson.topic}</span>
          <span>·</span>
          <span>{lesson.wordCount} 词</span>
          {markedComplete && (
            <>
              <span>·</span>
              <span className="progress-dot" />
              <span>{t('finishedBadge')}</span>
            </>
          )}
        </div>

        <div className="reader-toolbar">
          {playingIndex === null ? (
            <button className="btn btn-primary btn-sm" onClick={() => playFrom(0)}>{t('readAll')}</button>
          ) : (
            <button className="btn btn-danger btn-sm" onClick={stopPlayback}>{t('stop')}</button>
          )}
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t('speed')}</span>
          {[0.8, 1, 1.2, 1.5, 2].map((r) => (
            <button key={r} className={`speed-btn${rate === r ? ' active' : ''}`} onClick={() => setRate(r)}>
              {r}×
            </button>
          ))}
          <span className="spacer" />
          <select
            className="engine-select"
            value={enginePref}
            title="朗读引擎：Edge 免费高质量（默认）、OpenAI（可选）、系统语音"
            onChange={(e) => {
              setEnginePref(e.target.value);
              setEnginePrefState(e.target.value);
              stopPlayback();
            }}
          >
            <option value="auto">{t('engineAuto')}</option>
            <option value="edge">{t('engineEdge')}</option>
            <option value="openai" disabled={!engineStatus.openai}>
              {engineStatus.openai ? t('engineOpenai') : t('engineOpenaiOff')}
            </option>
            <option value="browser">{t('engineBrowser')}</option>
          </select>
          <span className="reader-hint" style={{ color: 'var(--muted)', fontSize: 13 }}>
            {t('readerHint')}
          </span>
        </div>

        {lesson.content.map((text, pIdx) => (
          <p key={pIdx}>
            {paragraphSentences[pIdx].map((s, order) => (
                <span
                  key={s.index}
                  className={`sentence${playingIndex === s.index ? ' playing' : ''}`}
                  onClick={() => playFrom(s.index)}
                  title={t('sentencePlayHint')}
                >
                  <button
                    className="sentence-play"
                    onClick={(e) => {
                      e.stopPropagation();
                      playFrom(s.index);
                    }}
                    title={t('sentencePlayHint')}
                  >
                    ▶
                  </button>
                  {sentenceTokens[s.index].map((t, i) =>
                    t.type === 'punct' ? (
                      <span key={i}>
                        {t.value}
                        {t.spaceAfter ? ' ' : ''}
                      </span>
                    ) : (
                      <span
                        key={i}
                        className={`reader-word${t.entry ? ' has-vocab' : ''}${isSaved(t) ? ' saved' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPopover(e, t);
                        }}
                        title={t.entry ? t.entry.translation : '查词'}
                      >
                        {t.value}
                        {t.spaceAfter ? ' ' : ''}
                      </span>
                    )
                  )}
                  {order < paragraphSentences[pIdx].length - 1 ? ' ' : ''}
                </span>
              ))}
          </p>
        ))}

        {!markedComplete && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button className="btn" onClick={markComplete}>{t('markComplete')}</button>
          </div>
        )}
      </div>

      {lesson.quiz.length > 0 && (
        <div className="quiz-section">
          <div className="section-title">
            <h2>{t('quizSection')}</h2>
          </div>
          <Quiz lesson={lesson} onFinished={() => setMarkedComplete(true)} />
        </div>
      )}

      <div className="quiz-section">
        <div className="section-title">
          <h2>{t('vocabSection')}</h2>
        </div>
        <div className="card" style={{ padding: '8px 18px' }}>
          <ul className="recent-list">
            {lesson.vocab.map((v) => (
              <li key={v.lemma}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => speak(v.word, { rate: 0.9 })}
                  title="朗读"
                  style={{ padding: '2px 8px' }}
                >
                  🔊
                </button>
                <div className="grow">
                  <span className="word" style={{ fontFamily: 'var(--serif)', fontWeight: 700 }}>{v.word}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 13 }}>
                    {lang === 'en' ? v.translationEn || v.translation : v.translation}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{v.partOfSpeech}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {popover && (
        <>
          <div className="popover-backdrop" onClick={() => setPopover(null)} />
          <div className="popover" style={{ left: popover.x, top: popover.y }}>
            <div className="popover-head">
              <span className="popover-word">{popover.token.value}</span>
              {popover.token.entry?.partOfSpeech && (
                <span className="popover-pos">{popover.token.entry.partOfSpeech}</span>
              )}
            </div>
            <div className="popover-trans">
              {lang === 'en'
                ? popover.token.entry?.translationEn || popover.token.entry?.translation || t('popoverNotInVocab')
                : popover.token.entry?.translation || t('popoverNotInVocab')}
            </div>
            <div className="popover-explain">
              {lang === 'en'
                ? popover.token.entry?.explanationEn || popover.token.entry?.explanation || t('popoverNotSaved')
                : popover.token.entry?.explanation || t('popoverNotSaved')}
            </div>
            <div className="popover-actions">
              <button
                className="btn btn-sm"
                onClick={() => speak(popover.token.value, { rate: 0.9 })}
              >
                {t('listen')}
              </button>
              <button
                className="btn btn-sm btn-primary"
                disabled={isSaved(popover.token)}
                onClick={() => saveWord(popover.token)}
              >
                {isSaved(popover.token) ? t('savedWord') : t('saveWord')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
