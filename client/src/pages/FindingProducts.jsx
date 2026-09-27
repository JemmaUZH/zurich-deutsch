import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { detectTtsEngines, speak, stopSpeech } from '../speech.js';
import { completeModule1Lesson, readModule1Progress } from '../data/module1.js';

const PHRASE = 'Entschuldigung, wo finde ich die Hafermilch?';
const ORDER = ['Entschuldigung,', 'wo', 'finde', 'ich', 'die', 'Hafermilch?'];
const WORDS = [
  { word: 'der Gang', meaning: 'aisle', note: 'Der Gang 4 — aisle 4' },
  { word: 'die Hafermilch', meaning: 'oat milk', note: 'Hafer = oats' },
  { word: 'finden', meaning: 'to find', note: 'Wo finde ich …? — Where can I find …?' },
  { word: 'Entschuldigung', meaning: 'excuse me', note: 'A polite way to start a question' },
];

function LessonIcon({ children }) {
  return <span className="lesson-flow-icon" aria-hidden="true">{children}</span>;
}

function ListenButton({ children = 'Listen', onClick, active = false }) {
  return (
    <button className={`lesson-flow-listen${active ? ' active' : ''}`} type="button" onClick={onClick}>
      <span aria-hidden="true">{active ? '■' : '▶'}</span> {children}
    </button>
  );
}

function ProgressHeader({ step, total }) {
  return (
    <div className="lesson-flow-progress" aria-label={`Lesson step ${step + 1} of ${total}`}>
      <div className="lesson-flow-progress-track"><span style={{ width: `${(step / (total - 1)) * 100}%` }} /></div>
      <span>{step + 1} / {total}</span>
    </div>
  );
}

export default function FindingProducts() {
  const [step, setStep] = useState(0);
  const [meaningChoice, setMeaningChoice] = useState(null);
  const [order, setOrder] = useState([]);
  const [orderError, setOrderError] = useState(false);
  const [listeningChoice, setListeningChoice] = useState(null);
  const [speakingState, setSpeakingState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [taskDone, setTaskDone] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zurich_theme') || 'system');
  const recognitionRef = useRef(null);
  const totalSteps = 9;

  const remainingWords = useMemo(() => ORDER.filter((word) => !order.includes(word)), [order]);
  const meaningCorrect = meaningChoice === 'where';
  const listeningCorrect = listeningChoice === 0;
  const orderComplete = order.length === ORDER.length;

  useEffect(() => {
    detectTtsEngines().finally(() => setTtsReady(true));
    setTaskDone(readModule1Progress().completedLessons.includes('finding-products'));
    return () => {
      stopSpeech();
      recognitionRef.current?.stop?.();
    };
  }, []);

  const listen = async (text = PHRASE) => {
    if (!ttsReady) await detectTtsEngines();
    stopSpeech();
    speak(text, { lang: 'de', rate: 0.88 });
  };

  const next = () => {
    stopSpeech();
    setStep((current) => Math.min(totalSteps - 1, current + 1));
  };

  const back = () => {
    stopSpeech();
    setStep((current) => Math.max(0, current - 1));
  };

  const chooseOrderWord = (word) => {
    const expected = ORDER[order.length];
    if (word === expected) {
      setOrder((current) => [...current, word]);
      setOrderError(false);
    } else {
      setOrderError(true);
    }
  };

  const startSpeaking = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeakingState('heard');
      return;
    }

    stopSpeech();
    const recognition = new Recognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setSpeakingState('listening');
    recognition.onresult = (event) => {
      setTranscript(event.results[0][0].transcript);
      setSpeakingState('heard');
    };
    recognition.onerror = () => setSpeakingState('heard');
    recognition.onend = () => setSpeakingState((current) => current === 'listening' ? 'heard' : current);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const finishTask = () => {
    completeModule1Lesson('finding-products');
    setTaskDone(true);
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('zurich_theme', nextTheme);
      return nextTheme;
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div className="lesson-flow-kicker">LESSON 1 · FINDING PRODUCTS</div>
            <div className="lesson-flow-hero-mark"><LessonIcon>⌂</LessonIcon></div>
            <h1>Find your way<br />around the shop.</h1>
            <p className="lesson-flow-lede">A short lesson for the moment when you know what you need — but not where it is.</p>
            <div className="lesson-flow-context">
              <span>Today at Migros or Coop</span>
              <strong>One useful question</strong>
              <small>About 8 minutes</small>
            </div>
            <button className="lesson-flow-primary" type="button" onClick={next}>Begin lesson <span>→</span></button>
          </>
        );
      case 1:
        return (
          <>
            <div className="lesson-flow-kicker">A FEW WORDS FIRST</div>
            <h1>The words you’ll need.</h1>
            <p className="lesson-flow-lede">Tap the speaker when you want to hear one again. You do not need to memorise everything.</p>
            <div className="lesson-flow-word-list">
              {WORDS.map((item) => (
                <div className="lesson-flow-word" key={item.word}>
                  <div><strong lang="de">{item.word}</strong><span>{item.meaning}</span><small>{item.note}</small></div>
                  <button type="button" aria-label={`Listen to ${item.word}`} onClick={() => listen(item.word)}>▶</button>
                </div>
              ))}
            </div>
            <button className="lesson-flow-primary" type="button" onClick={next}>I’m ready <span>→</span></button>
          </>
        );
      case 2:
        return (
          <>
            <div className="lesson-flow-kicker">THE REAL SENTENCE</div>
            <h1>Here is the question.</h1>
            <p className="lesson-flow-lede">This is a sentence you can use today, exactly as it is.</p>
            <div className="lesson-flow-phrase-card">
              <p lang="de">{PHRASE}</p>
              <ListenButton onClick={() => listen()} />
              <div className="lesson-flow-translation">Excuse me, where can I find the oat milk?</div>
            </div>
            <p className="lesson-flow-note"><strong>Entschuldigung</strong> makes the question polite. Start there when you need someone’s attention.</p>
            <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>
          </>
        );
      case 3:
        return (
          <>
            <div className="lesson-flow-kicker">CHECK THE MEANING</div>
            <h1>What are you asking?</h1>
            <div className="lesson-flow-prompt" lang="de">{PHRASE}</div>
            <div className="lesson-flow-options">
              <button className={meaningChoice === 'where' ? 'selected' : ''} type="button" onClick={() => setMeaningChoice('where')}>Where can I find the oat milk?</button>
              <button className={meaningChoice === 'price' ? 'selected' : ''} type="button" onClick={() => setMeaningChoice('price')}>How much is the oat milk?</button>
              <button className={meaningChoice === 'checkout' ? 'selected' : ''} type="button" onClick={() => setMeaningChoice('checkout')}>Can I pay by card?</button>
            </div>
            {meaningChoice && <p className={`lesson-flow-feedback ${meaningCorrect ? 'good' : 'try'}`}>{meaningCorrect ? 'Yes — you are asking where something is.' : 'Not quite. “Wo” asks where. Try once more.'}</p>}
            {meaningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}
          </>
        );
      case 4:
        return (
          <>
            <div className="lesson-flow-kicker">PUT IT TOGETHER</div>
            <h1>Build the question.</h1>
            <p className="lesson-flow-lede">Choose the next word. German questions often begin with the question word or a polite opener.</p>
            <div className="lesson-flow-built-sentence" aria-live="polite">{order.length ? order.join(' ') : 'Choose a word below'}</div>
            <div className="lesson-flow-token-grid">
              {remainingWords.map((word) => <button key={word} type="button" onClick={() => chooseOrderWord(word)}>{word}</button>)}
            </div>
            {orderError && <p className="lesson-flow-feedback try">Try the polite opener first: <strong>Entschuldigung,</strong></p>}
            {orderComplete && <p className="lesson-flow-feedback good">Good. That is the sentence you need.</p>}
            {orderComplete && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}
          </>
        );
      case 5:
        return (
          <>
            <div className="lesson-flow-kicker">LISTEN FOR THE SHAPE</div>
            <h1>Which sentence did you hear?</h1>
            <p className="lesson-flow-lede">Listen once, then choose the sentence that matches.</p>
            <div className="lesson-flow-listen-stage"><ListenButton children="Play sentence" onClick={() => listen()} active={false} /></div>
            <div className="lesson-flow-options listening-options">
              <button className={listeningChoice === 0 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(0)}>Entschuldigung, wo finde ich die Hafermilch?</button>
              <button className={listeningChoice === 1 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(1)}>Entschuldigung, ich kaufe die Hafermilch.</button>
              <button className={listeningChoice === 2 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(2)}>Wo ist die Kasse, bitte?</button>
            </div>
            {listeningChoice !== null && <p className={`lesson-flow-feedback ${listeningCorrect ? 'good' : 'try'}`}>{listeningCorrect ? 'That’s it. You heard the question shape.' : 'Listen for “wo finde ich” — where can I find.'}</p>}
            {listeningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}
          </>
        );
      case 6:
        return (
          <>
            <div className="lesson-flow-kicker">SAY IT ONCE</div>
            <h1>Now ask it yourself.</h1>
            <p className="lesson-flow-lede">Say the sentence out loud. Aim for clear and polite, not perfect.</p>
            <div className="lesson-flow-speak-card">
              <p lang="de">{PHRASE}</p>
              <button className={`lesson-flow-mic${speakingState === 'listening' ? ' listening' : ''}`} type="button" onClick={startSpeaking}>
                <span aria-hidden="true">{speakingState === 'listening' ? '●' : '◉'}</span>
                {speakingState === 'listening' ? 'Listening…' : 'Tap, then speak'}
              </button>
              {transcript && <small>Heard: “{transcript}”</small>}
            </div>
            <p className="lesson-flow-note">If your browser cannot use the microphone, simply say it once and tap the button again.</p>
            {speakingState === 'heard' && <button className="lesson-flow-primary" type="button" onClick={next}>I said it <span>→</span></button>}
          </>
        );
      case 7:
        return (
          <>
            <div className="lesson-flow-kicker">A ZURICH TIP</div>
            <h1>Know the word “Pflanzendrinks”.</h1>
            <div className="lesson-flow-tip-card">
              <LessonIcon>↗</LessonIcon>
              <p>Swiss supermarkets often group oat milk with <strong lang="de">Pflanzendrinks</strong> — plant-based drinks. If you do not see <strong lang="de">Hafermilch</strong>, ask for that section instead.</p>
            </div>
            <p className="lesson-flow-note">One question in German is enough for today.</p>
            <button className="lesson-flow-primary" type="button" onClick={next}>Finish lesson <span>→</span></button>
          </>
        );
      case 8:
        return (
          <>
            <div className="lesson-flow-kicker">LESSON COMPLETE</div>
            <div className="lesson-flow-complete-mark"><LessonIcon>✓</LessonIcon></div>
            <h1>Take it to the shop.</h1>
            <p className="lesson-flow-lede">You now have one useful question for a real Zurich supermarket.</p>
            <div className="lesson-flow-task-card">
              <small>REAL-WORLD TASK</small>
              <strong>Ask one question in German at Migros or Coop this week.</strong>
              <span lang="de">„Entschuldigung, wo finde ich die Hafermilch?“</span>
            </div>
            {!taskDone ? (
              <button className="lesson-flow-primary" type="button" onClick={finishTask}>I’ll try this <span>→</span></button>
            ) : (
              <div className="lesson-flow-task-done">Task saved for this week.</div>
            )}
            <Link className="lesson-flow-back" to="/">Back to Module 1</Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`lesson-flow-page theme-${theme}`}>
      <div className="lesson-flow-appbar">
        <Link to="/" className="lesson-flow-back-arrow" aria-label="Back to Module 1">‹</Link>
        <span>Module 1 · Migros &amp; Coop</span>
        <span className="lesson-flow-appbar-spacer" />
        <button className="lesson-flow-theme" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☼' : '☾'}</button>
      </div>
      <main className="lesson-flow">
        <ProgressHeader step={step} total={totalSteps} />
        <section className="lesson-flow-card" aria-live="polite">
          {renderStep()}
        </section>
        {step > 0 && step < totalSteps - 1 && <button className="lesson-flow-secondary" type="button" onClick={back}>Back</button>}
      </main>
    </div>
  );
}
