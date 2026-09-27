import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { completeModule1Mission, readModule1Progress } from '../data/module1.js';

const TASKS = [
  ['Find one Aktion', 'Look for a shelf sign with “Aktion”, “statt” or “jetzt”.'],
  ['Understand one sign', 'Notice one price, unit or direction sign in German.'],
  ['Ask one question', 'Use: “Entschuldigung, wo finde ich …?”'],
  ['Listen to the answer', 'Listen for a direction such as “Da vorne” or “Im nächsten Gang”.'],
  ['Answer at the checkout', 'Use “Mit Karte, bitte”, “Nein, danke” or another phrase you learned.'],
  ['Finish with Danke', 'Say “Danke” and let the small interaction be enough.'],
];

export default function MigrosMission() {
  const [progress] = useState(readModule1Progress);
  const [checked, setChecked] = useState(() => TASKS.map(() => false));
  const [done, setDone] = useState(() => progress.missionTried);
  const allChecked = checked.every(Boolean);

  if (progress.completedLessons.length < 5) return <Navigate to="/" replace />;

  const toggle = (index) => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value));
  const complete = () => {
    if (!allChecked) return;
    completeModule1Mission();
    setDone(true);
  };

  return <div className="lesson-flow-page theme-system">
    <div className="lesson-flow-appbar"><Link to="/" className="lesson-flow-back-arrow" aria-label="Back to Module 1">‹</Link><span>Module 1 · Migros &amp; Coop</span><span className="lesson-flow-appbar-spacer" /></div>
    <main className="lesson-flow mission-flow">
      <section className="lesson-flow-card">
        <div className="lesson-flow-kicker">REAL-LIFE MISSION · SUMMIT</div>
        <div className="lesson-flow-hero-mark mission-flow-mark"><span className="lesson-flow-icon">↗</span></div>
        <h1>Your Migros / Coop mission.</h1>
        <p className="lesson-flow-lede">Use what you already know during one real supermarket trip. No proof is needed. Just notice, ask, listen and respond.</p>
        <div className="mission-flow-list">
          {TASKS.map(([title, description], index) => <button className={`mission-flow-task${checked[index] ? ' checked' : ''}`} type="button" key={title} onClick={() => toggle(index)}><span className="mission-flow-check" aria-hidden="true">{checked[index] ? '✓' : index + 1}</span><span><strong>{title}</strong><small>{description}</small></span></button>)}
        </div>
        {!done ? <button className="lesson-flow-primary" type="button" onClick={complete} disabled={!allChecked}>I completed the mission <span>→</span></button> : <div className="lesson-flow-task-done">Mission saved. Nice work.</div>}
        <p className="lesson-flow-note">The mission is a transfer task, not another lesson. It introduces no new vocabulary.</p>
        <Link className="lesson-flow-back" to="/">Back to Module 1</Link>
      </section>
    </main>
  </div>;
}
