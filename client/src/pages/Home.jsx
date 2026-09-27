import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MODULE1_LESSONS,
  MODULE1_MISSION,
  readModule1Progress,
  startModule1Mission,
  startModule1Lesson,
} from '../data/module1.js';

const TRAIL_ITEMS = [...MODULE1_LESSONS, MODULE1_MISSION];

function TrailIcon({ name }) {
  const icons = {
    bag: <><path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2M4 8h16" /></>,
    tag: <><path d="M20 12.5V6a1 1 0 0 0-1-1h-6.5a1 1 0 0 0-.7.3l-8 8a1 1 0 0 0 0 1.4l6.5 6.5a1 1 0 0 0 1.4 0l8-8a1 1 0 0 0 .3-.7Z" /><circle cx="15.2" cy="8.8" r="1.3" fill="currentColor" stroke="none" /></>,
    card: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M4 10h16M7 14h4" /></>,
    loyalty: <><rect x="3.5" y="6.5" width="17" height="11" rx="2" /><path d="M3.5 10.5h17M6.5 14.2h4" /></>,
    receipt: <><path d="M7 4h10v16l-2.5-1.5L12 20l-2.5-1.5L7 20V4Z" /><path d="M9.5 8h5M9.5 11h5M9.5 14h3" /></>,
    summit: <><path d="M3 19h18L14.5 8l-2.8 4.4L9 9.5 3 19Z" /><path d="M14.5 8V3.5l3 1.4-3 1.4" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="trail-icon" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

function TrailConnector({ mirror = false }) {
  return <div className="trail-connector" aria-hidden="true"><svg className={mirror ? 'mirror' : ''} viewBox="0 0 46 38"><path d="M17 0 C17 16, 33 22, 33 38" /></svg></div>;
}

function getStatus(item, progress) {
  if (item.id === MODULE1_MISSION.id) {
    if (progress.missionTried) return 'done';
    return progress.completedLessons.length === MODULE1_LESSONS.length ? 'available' : 'locked';
  }
  if (progress.completedLessons.includes(item.id)) return 'done';
  if (progress.currentLesson === item.id) return 'active';
  return 'available';
}

function TrailNode({ item, progress }) {
  const status = getStatus(item, progress);
  const isMission = item.id === MODULE1_MISSION.id;
  const isLocked = status === 'locked';
  const statusLabel = status === 'done'
    ? 'Completed'
    : status === 'active'
      ? 'Start lesson'
      : isMission && isLocked
        ? 'Unlocks after 5 lessons'
        : 'Available';
  const content = (
    <>
      <div className="trail-marker-col"><div className="trail-dot"><TrailIcon name={item.icon} /></div></div>
      <div className="trail-content">
        <h3>{item.title}</h3>
        {item.phrase && <p className="trail-phrase" lang="de">“{item.phrase}”</p>}
        <p className="trail-desc">{item.description}</p>
        <span className={`trail-status ${status}`}>{statusLabel}</span>
      </div>
    </>
  );

  if (isLocked) return <div className={`trail-step ${status}${isMission ? ' summit' : ''}`} aria-disabled="true">{content}</div>;
  return <Link className={`trail-step trail-step-link ${status}${isMission ? ' summit' : ''}`} to={item.route} onClick={() => isMission ? startModule1Mission() : startModule1Lesson(item.id)}>{content}</Link>;
}

function TrailHeader({ progress, theme, onThemeChange }) {
  const doneCount = progress.completedLessons.length;
  return <>
    <div className="trail-appbar">
      <span className="trail-back" aria-hidden="true">‹</span>
      <div className="trail-brand"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 19h20L15.5 8l-3.3 5.2L9 9l-7 10z" /></svg>German for Zurich</div>
      <button className="trail-theme-toggle" type="button" onClick={onThemeChange} aria-label="Toggle theme" title="Toggle theme">{theme === 'dark' ? '☼' : '☾'}</button>
    </div>
    <section className="trail-header-band">
      <svg className="trail-contours" viewBox="0 0 420 140" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M-10 100 Q 90 70 190 100 T 430 95" /><path d="M-10 118 Q 100 92 210 118 T 430 112" /><path d="M-10 135 Q 110 112 220 134 T 430 128" /></svg>
      <div className="trail-header-content">
        <p className="trail-eyebrow">Module 1</p>
        <h1>Migros &amp; Coop</h1>
        <p className="trail-lede">Learn the German you’ll actually see, hear and use while grocery shopping in Zurich.</p>
        <div className="trail-progress-row"><div className="trail-progress-track"><div className="trail-progress-fill" style={{ width: `${(doneCount / MODULE1_LESSONS.length) * 100}%` }} /></div><span className="trail-progress-label">{doneCount} of {MODULE1_LESSONS.length} lessons</span></div>
      </div>
    </section>
  </>;
}

export default function Home() {
  const [progress, setProgress] = useState(readModule1Progress);
  const [theme, setTheme] = useState(() => localStorage.getItem('zurich_theme') || 'system');

  useEffect(() => {
    const refresh = () => setProgress(readModule1Progress());
    window.addEventListener('module1-progress-change', refresh);
    return () => window.removeEventListener('module1-progress-change', refresh);
  }, []);

  useEffect(() => {
    if (theme === 'system') localStorage.removeItem('zurich_theme');
    else localStorage.setItem('zurich_theme', theme);
    document.body.dataset.trailTheme = theme;
    return () => { delete document.body.dataset.trailTheme; };
  }, [theme]);

  const cycleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return <div className={`trail-page theme-${theme}`}>
    <div className="trail-page-inner">
      <TrailHeader progress={progress} theme={theme} onThemeChange={cycleTheme} />
      <main className="trail-main">
        <div className="trail-list" aria-label="Migros and Coop lessons">
          {TRAIL_ITEMS.map((item, index) => <div key={item.id}><TrailNode item={item} progress={progress} />{index < TRAIL_ITEMS.length - 1 && <TrailConnector mirror={index % 2 === 1} />}</div>)}
        </div>
        <p className="trail-footnote"><strong>About 20–25 minutes total.</strong></p>
      </main>
    </div>
  </div>;
}
