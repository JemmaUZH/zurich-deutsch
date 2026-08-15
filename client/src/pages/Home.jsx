import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n, topicLabel } from '../i18n.jsx';

const LEVELS = ['all', 'A1', 'A2', 'B1', 'B2', 'C1'];

export default function Home() {
  const { lang, t } = useI18n();
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [level, setLevel] = useState('all');
  const [module, setModule] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/lessons'), api('/stats')])
      .then(([lessonData, statsData]) => {
        setLessons(lessonData.lessons);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">{t('loading')}</div>;

  const filtered = lessons.filter(
    (l) =>
      (level === 'all' || l.level === level) &&
      (module === 'all' || (l.language || 'de') === module)
  );

  return (
    <div className="page">
      <div className="hero">
        <h1>{t('heroGreeting')}</h1>
        <p>{t('heroDesc')}</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>🔥 {stats.streak}</b>
            {t('statStreak')}
          </div>
          <div className="hero-stat">
            <b>📚 {stats.lessonsCompleted}</b>
            {t('statLessons')}
          </div>
          <div className="hero-stat">
            <b>🗂️ {stats.wordsLearned}</b>
            {t('statWords')}
          </div>
          <div className="hero-stat">
            <b>⏰ {stats.dueCount}</b>
            {t('statDue')}
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>{t('lessonTitle')}</h2>
        <div className="filters">
          <button className={`chip${module === 'all' ? ' active' : ''}`} onClick={() => setModule('all')}>
            {t('all')}
          </button>
          <button className={`chip${module === 'de' ? ' active' : ''}`} onClick={() => setModule('de')}>
            {t('moduleDe')}
          </button>
          <button className={`chip${module === 'en' ? ' active' : ''}`} onClick={() => setModule('en')}>
            {t('moduleEn')}
          </button>
        </div>
        <div className="filters">
          {LEVELS.map((l) => (
            <button
              key={l}
              className={`chip${level === l ? ' active' : ''}`}
              onClick={() => setLevel(l)}
            >
              {l === 'all' ? t('all') : l}
            </button>
          ))}
        </div>
      </div>

      <div className="lesson-grid">
        {filtered.map((lesson) => (
          <Link key={lesson.id} to={`/lesson/${lesson.id}`} className="lesson-card">
            <div className="lesson-card-top">
              <span className="lesson-emoji">{lesson.emoji}</span>
              <h3>{lesson.title}</h3>
            </div>
            <p>{lang === 'en' ? lesson.descriptionEn || lesson.description : lesson.description}</p>
            <div className="lesson-meta">
              <span className={`lang-badge${(lesson.language || 'de') === 'en' ? ' lang-en' : ''}`}>
                {(lesson.language || 'de') === 'en' ? 'EN' : 'DE'}
              </span>
              <span className={`level-badge level-${lesson.level}`}>{lesson.level}</span>
              <span>{topicLabel(lesson.topic, lang)}</span>
              <span>·</span>
              <span>{t('wordCount', { n: lesson.wordCount })}</span>
              {lesson.progress?.completed_at && (
                <>
                  <span>·</span>
                  <span className="progress-dot" title="已完成" />
                  <span>{t('completed')}</span>
                </>
              )}
              {lesson.progress?.best_score != null && (
                <>
                  <span>·</span>
                  <span>{t('bestScore', { n: lesson.progress.best_score })}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty">{t('emptyLevel')}</div>}

      {stats.recent.length > 0 && (
        <>
          <div className="section-title">
            <h2>{t('recentQuiz')}</h2>
          </div>
          <div className="card">
            <ul className="recent-list">
              {stats.recent.map((r) => (
                <li key={r.taken_at + r.lesson_id}>
                  <span>{r.emoji}</span>
                  <Link to={`/lesson/${r.lesson_id}`}>{r.title}</Link>
                  <span className="recent-score">{r.score}/{r.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
