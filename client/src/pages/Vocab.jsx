import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';
import { useI18n } from '../i18n.jsx';
import { formatDue } from '../utils.js';

export default function Vocab() {
  const notify = useToast();
  const { lang, t } = useI18n();
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState('due');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/vocab').then((data) => {
      setItems(data.items);
      setLoading(false);
    });
  }, []);

  const dueItems = useMemo(() => items.filter((i) => i.due), [items]);
  const queue = useMemo(() => (mode === 'due' ? dueItems : items), [mode, items, dueItems]);

  if (loading) return <div className="spinner">{t('loading')}</div>;

  return (
    <div className="page">
      <div className="section-title">
        <h2>{t('vocabTitle')}</h2>
        <div className="filters">
          <button className={`chip${mode === 'due' ? ' active' : ''}`} onClick={() => setMode('due')}>
            {t('dueTab', { n: dueItems.length })}
          </button>
          <button className={`chip${mode === 'all' ? ' active' : ''}`} onClick={() => setMode('all')}>
            {t('allTab', { n: items.length })}
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="empty">
          {items.length === 0 ? (
            <>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🗂️</div>
              {t('emptyNoWords')}
              <br />
              <Link to="/">{t('goRead')}</Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🎉</div>
              {t('emptyDone')}
            </>
          )}
        </div>
      ) : (
        <Flashcards key={`${mode}-${queue.length}`} queue={queue} onReviewed={notify} />
      )}

      <div className="section-title">
        <h2>{t('listTitle')}</h2>
      </div>
      <div className="vocab-list">
        {items.map((item) => (
          <div key={item.id} className="vocab-row">
            <span style={{ fontSize: 20 }}>{item.lesson_emoji}</span>
            <div className="grow">
              <div className="word">{item.word}</div>
              <div className="trans">{item.translation || t('noTranslation')} · {item.lesson_title}</div>
            </div>
            <span className={`due-badge${!item.due ? ' ok' : ''}`}>
              {item.due ? formatDue(item.due_at, lang) : t('scheduled')}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              title={t('removeWord')}
              onClick={async () => {
                await api(`/vocab/${item.id}`, { method: 'DELETE' });
                setItems((list) => list.filter((x) => x.id !== item.id));
                notify(t('removedToast'));
              }}
            >
              🗑️
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="empty">{t('noWordsYet')}</div>}
      </div>
    </div>
  );
}

function Flashcards({ queue, onReviewed }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [busy, setBusy] = useState(false);

  const item = queue[index];
  const total = queue.length;
  const GRADES = [
    { key: 0, label: t('grades.again'), cls: 'grade-again', intervalKey: 'again' },
    { key: 1, label: t('grades.hard'), cls: 'grade-hard', intervalKey: 'hard' },
    { key: 2, label: t('grades.good'), cls: 'grade-good', intervalKey: 'good' },
    { key: 3, label: t('grades.easy'), cls: 'grade-easy', intervalKey: 'easy' },
  ];

  const grade = async (key) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api(`/vocab/${item.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ grade: key }),
      });
      const g = GRADES.find((x) => x.key === key);
      onReviewed(t('nextReview', { word: item.word, interval: t(`gradeIntervals.${g.intervalKey}`) }));
      setDone((n) => n + 1);
      setFlipped(false);
      setIndex((n) => n + 1);
      if (index + 1 >= total) {
        setIndex(0);
      }
    } finally {
      setBusy(false);
    }
  };

  if (!item) return null;

  if (done >= total) {
    return (
      <div className="quiz-question quiz-result">
        <div className="score">🎉 {total} / {total}</div>
        <div className="score-label">{t('roundDone')}</div>
        <button className="btn btn-primary" onClick={() => { setDone(0); setIndex(0); }}>
          {t('reviewAgain')}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flashcard-stage">
        <div
          className={`flashcard${flipped ? ' flipped' : ''}`}
          onClick={() => !busy && setFlipped((f) => !f)}
        >
          <div className="flashcard-face front">
            <div className="word">{item.word}</div>
            <div className="trans">{item.translation || t('noTranslation')}</div>
            <span className="hint">{t('flashHintFront')}</span>
          </div>
          <div className="flashcard-face back">
            <div className="word" style={{ fontSize: 26 }}>{item.word}</div>
            <div className="trans">{item.translation || t('noTranslation')}</div>
            {item.part_of_speech && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                {item.part_of_speech}
              </div>
            )}
            {item.explanation && (
              <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                {item.explanation}
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              {t('fromLesson', { title: item.lesson_title })}
            </div>
            <span className="hint">{t('flashHintBack')}</span>
          </div>
        </div>
      </div>

      <div className="queue-info">
        {t('cardProgress', { n: index + 1, total, done })}
      </div>

      <div className="grade-row">
        {GRADES.map((g) => (
          <button
            key={g.key}
            className={`grade-btn ${g.cls}`}
            disabled={!flipped || busy}
            onClick={() => grade(g.key)}
          >
            {g.label}
          </button>
        ))}
      </div>
    </>
  );
}
