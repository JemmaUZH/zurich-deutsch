import { useState } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  { id: 'start', label: 'Arrival', icon: '✈️' },
  { id: 'pass', label: 'SBB counter', icon: '🎫' },
  { id: 'tram10', label: 'Tram 10', icon: '🚋' },
  { id: 'check', label: 'Ticket check', icon: '👋' },
  { id: 'tram6', label: 'Change', icon: '🔁' },
  { id: 'zoo', label: 'Zoo', icon: '🦁' },
];

function Choice({ children, onClick, selected, disabled }) {
  return (
    <button className={`mission-choice${selected ? ' selected' : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Help({ children }) {
  return <div className="mission-help"><span>💡</span><div>{children}</div></div>;
}

export default function Mission() {
  const [step, setStep] = useState(0);
  const [passChoice, setPassChoice] = useState(null);
  const [routeChoice, setRouteChoice] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const current = steps[step];
  const progress = Math.round((step / (steps.length - 1)) * 100);

  const advance = (nextStep) => {
    setShowHelp(false);
    setStep(nextStep);
  };

  return (
    <main className="mission-page">
      <div className="mission-shell">
        <Link to="/" className="mission-back">← Library</Link>

        <div className="mission-heading">
          <div>
            <span className="eyebrow">MISSION 01 · ZÜRICH · A1</span>
            <h1>Flughafen → Zoo</h1>
            <p>You have just arrived in Zurich. Your new home is near the zoo. Get there using German when you need it.</p>
          </div>
          <div className="mission-heading-stamp">10<br /><small>MIN</small></div>
        </div>

        <div className="mission-progress-wrap">
          <div className="mission-progress-line"><span style={{ width: `${progress}%` }} /></div>
          <div className="mission-steps">
            {steps.map((item, index) => (
              <div key={item.id} className={`mission-step${index <= step ? ' reached' : ''}${index === step ? ' current' : ''}`}>
                <span>{item.icon}</span><small>{item.label}</small>
              </div>
            ))}
          </div>
        </div>

        <section className="mission-card">
          {step === 0 && (
            <>
              <div className="scene-label">SCENE 01 · ARRIVAL HALL</div>
              <div className="scene-visual airport-visual"><span>✈</span><b>Flughafen Zürich</b><small>Arrival hall · 14:20</small></div>
              <p className="scene-text">Your phone is at 18%. You have two suitcases and an address in Zürich near the Zoo. First, you need a Zurich transport pass.</p>
              <div className="mission-dialogue">
                <div className="speaker other"><b>SBB Mitarbeiterin</b><span>Grüezi. Wie kann ich Ihnen helfen?</span></div>
                <div className="speaker learner"><b>You</b><span>English, please.</span></div>
              </div>
              <p className="mission-prompt">You want to explain what you need. Which sentence helps?</p>
              <Choice onClick={() => advance(1)}>Ich brauche ein Jahresabo für Zürich.</Choice>
              <Choice onClick={() => setShowHelp(true)}>Ich habe einen Zoo.</Choice>
              {showHelp && <Help><b>Jahresabo</b> means yearly pass. Try: <i>Ich brauche ein Jahresabo für Zürich.</i></Help>}
            </>
          )}

          {step === 1 && (
            <>
              <div className="scene-label">SCENE 02 · SBB REISEZENTRUM</div>
              <div className="mission-dialogue">
                <div className="speaker other"><b>SBB Mitarbeiterin</b><span>Sie möchten ein Jahresabo für die Zone 110?</span></div>
                <div className="speaker learner"><b>You</b><span>Ja, für ein Jahr. Und ein Halbtax, bitte.</span></div>
                <div className="speaker other"><b>SBB Mitarbeiterin</b><span>Haben Sie einen SwissPass?</span></div>
              </div>
              <p className="scene-text">This is your first SwissPass. You show your passport and photo. The staff member checks the two products before you pay.</p>
              <div className="mission-form-card">
                <div><span>✓</span><b>Jahresabo</b><small>Zone 110 · 1 Jahr</small></div>
                <div><span>✓</span><b>Halbtax</b><small>First purchase · SwissPass</small></div>
              </div>
              <p className="mission-prompt">The staff member asks where you are going next. What do you say?</p>
              <Choice onClick={() => { setPassChoice('correct'); advance(2); }}>Ich fahre zum Zoo.</Choice>
              <Choice onClick={() => { setPassChoice('help'); setShowHelp(true); }}>Ich fahre in den Zug.</Choice>
              {showHelp && <Help><b>zum Zoo</b> means to the zoo. <i>Ich fahre zum Zoo.</i></Help>}
            </>
          )}

          {step === 2 && (
            <>
              <div className="scene-label">SCENE 03 · OUTSIDE THE AIRPORT CENTER</div>
              <div className="route-board"><div><span>TRAM</span><b>10</b></div><strong>Richtung Zürich HB</strong><small>Next tram · 14:31</small></div>
              <p className="scene-text">The SBB employee points outside. You find the tram stop. Two trams are waiting, but only one says <b>Richtung Zürich HB</b>.</p>
              <div className="mission-dialogue compact"><div className="speaker other"><b>Passagier</b><span>Fahren Sie zum Hauptbahnhof?</span></div><div className="speaker learner"><b>You</b><span>Ja. Tram 10, Richtung Zürich HB.</span></div></div>
              <p className="mission-prompt">Choose the tram you need.</p>
              <div className="tram-options">
                <Choice onClick={() => setShowHelp(true)}><span className="tram-number">10</span><span>Richtung Flughafen</span></Choice>
                <Choice onClick={() => advance(3)}><span className="tram-number">10</span><span>Richtung Zürich HB</span></Choice>
              </div>
              {showHelp && <Help>Look for <b>Richtung Zürich HB</b>. <i>Richtung</i> tells you the direction.</Help>}
            </>
          )}

          {step === 3 && (
            <>
              <div className="scene-label">SCENE 04 · ON TRAM 10</div>
              <div className="tram-window"><span>10</span><b>Zürich HB</b><small>Next stop: Bahnhofplatz/HB</small></div>
              <div className="mission-dialogue">
                <div className="speaker other"><b>Man</b><span>Grüezi.</span></div>
                <div className="speaker learner"><b>You</b><span>Grüezi.</span></div>
                <div className="speaker other"><b>Kontrolleur</b><span>Billettkontrolle. Ihr Billett, bitte.</span></div>
              </div>
              <p className="scene-text">You thought he was just being friendly. He is checking tickets. Your new pass is in the app.</p>
              <p className="mission-prompt">What should you do?</p>
              <Choice onClick={() => advance(4)}>SBB Mobile öffnen und «Tickets & Travelcards» zeigen.</Choice>
              <Choice onClick={() => setShowHelp(true)}>Aus dem Fenster schauen.</Choice>
              {showHelp && <Help><b>Billettkontrolle</b> means ticket inspection. Open the app and show your ticket.</Help>}
              <div className="phrase-strip"><b>Useful:</b> <i>Ihr Billett, bitte.</i> · <i>Einen Moment, bitte.</i></div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="scene-label">SCENE 05 · CHANGE AT HB</div>
              <div className="app-check"><div className="phone"><span>SBB Mobile</span><b>Tickets & Travelcards</b><div>✓ Halbtax</div><div>✓ ZVV Jahresabo · Zone 110</div><strong>QR-Code</strong></div><div className="scan-note">Alles in Ordnung.<br /><small>Your pass is visible. You can continue.</small></div></div>
              <div className="mission-dialogue compact"><div className="speaker other"><b>Kontrolleur</b><span>Alles in Ordnung. Gute Fahrt!</span></div><div className="speaker learner"><b>You</b><span>Danke. Ihnen auch.</span></div></div>
              <p className="scene-text">At Zürich HB, follow the signs to the tram stop. You need line 6, not line 10.</p>
              <p className="mission-prompt">Which direction is correct?</p>
              <div className="tram-options">
                <Choice onClick={() => { setRouteChoice('wrong'); setShowHelp(true); }}><span className="tram-number">6</span><span>Richtung Werdhölzli</span></Choice>
                <Choice onClick={() => advance(5)}><span className="tram-number">6</span><span>Richtung Zoo</span></Choice>
              </div>
              {showHelp && <Help>Your destination is Zoo. Choose <b>Tram 6 · Richtung Zoo</b>.</Help>}
            </>
          )}

          {step === 5 && (
            <>
              <div className="scene-label">MISSION COMPLETE · ZÜRICH ZOO</div>
              <div className="success-visual"><span>🦁</span><b>Du hast es geschafft!</b><small>Welcome to Zurich.</small></div>
              <p className="scene-text">You made it from the airport to your new neighbourhood. You bought the right passes, showed your app, and found the right tram.</p>
              <div className="mission-summary"><div><b>✓</b><span>Bought the right pass<small>Jahresabo · Zone 110</small></span></div><div><b>✓</b><span>Survived a ticket check<small>Tickets & Travelcards</small></span></div><div><b>✓</b><span>Found the way<small>Tram 10 → Tram 6 → Zoo</small></span></div></div>
              <div className="mission-phrase-review"><span>Today you can say:</span><b>Wo ist die Tramhaltestelle?</b><b>Fährt dieses Tram zum Zoo?</b><b>Ich bin neu in Zürich.</b></div>
              <button className="btn btn-primary btn-block" onClick={() => { setStep(0); setShowHelp(false); }}>Play again</button>
            </>
          )}
        </section>

        <div className="mission-footer-note">You do not need to understand every word. Your goal is to get where you need to go.</div>
      </div>
    </main>
  );
}
