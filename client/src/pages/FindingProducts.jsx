import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { detectTtsEngines, speak, stopSpeech } from '../speech.js';
import { completeModule1Lesson, readModule1Progress } from '../data/module1.js';

const PHRASE = 'Entschuldigung, wo finde ich die Hafermilch?';
const VARIATIONS = ['Wo finde ich die Eier?', 'Wo gibt es Reis?', 'Haben Sie Hafermilch?', 'Wo ist die Kasse?'];
const ORDER = ['Entschuldigung,', 'wo', 'finde', 'ich', 'die', 'Eier?'];
const WORDS = [
  ['Entschuldigung', 'excuse me', 'A polite way to start a question'],
  ['der Gang', 'aisle', 'Der Gang 4 — aisle 4'],
  ['das Regal', 'shelf', 'im Regal — on the shelf'],
  ['finden', 'to find', 'Wo finde ich …? — Where can I find …?'],
];
const DIRECTIONS = [
  ['Im nächsten Gang.', 'In the next aisle.'],
  ['Da vorne.', 'Up there / over there.'],
  ['Hinten links.', 'At the back on the left.'],
  ['Neben der Kasse.', 'Next to the checkout.'],
  ['Gleich dort.', 'Right there.'],
];

function ListenButton({ children = 'Listen', onClick }) {
  return <button className="lesson-flow-listen" type="button" onClick={onClick}><span aria-hidden="true">▶</span> {children}</button>;
}

function ProgressHeader({ step, total }) {
  return <div className="lesson-flow-progress" aria-label={`Lesson step ${step + 1} of ${total}`}><div className="lesson-flow-progress-track"><span style={{ width: `${(step / (total - 1)) * 100}%` }} /></div><span>{step + 1} / {total}</span></div>;
}

export default function FindingProducts() {
  const [step, setStep] = useState(0);
  const [directionChoice, setDirectionChoice] = useState(null);
  const [order, setOrder] = useState([]);
  const [orderError, setOrderError] = useState(false);
  const [listeningChoice, setListeningChoice] = useState(null);
  const [responseChoice, setResponseChoice] = useState(null);
  const [speakingState, setSpeakingState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [taskDone, setTaskDone] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zurich_theme') || 'system');
  const recognitionRef = useRef(null);
  const totalSteps = 10;
  const remainingWords = useMemo(() => ORDER.filter((word) => !order.includes(word)), [order]);
  const orderComplete = order.length === ORDER.length;
  const directionCorrect = directionChoice === 0;
  const listeningCorrect = listeningChoice === 0;
  const responseCorrect = responseChoice === 0 || responseChoice === 1;

  useEffect(() => {
    detectTtsEngines().finally(() => setTtsReady(true));
    setTaskDone(readModule1Progress().completedLessons.includes('finding-products'));
    return () => { stopSpeech(); recognitionRef.current?.stop?.(); };
  }, []);

  const listen = async (text = PHRASE) => { if (!ttsReady) await detectTtsEngines(); stopSpeech(); speak(text, { lang: 'de', rate: 0.88 }); };
  const next = () => { stopSpeech(); setStep((current) => Math.min(totalSteps - 1, current + 1)); };
  const back = () => { stopSpeech(); setStep((current) => Math.max(0, current - 1)); };
  const chooseOrderWord = (word) => { if (word === ORDER[order.length]) { setOrder((current) => [...current, word]); setOrderError(false); } else setOrderError(true); };
  const startSpeaking = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setSpeakingState('heard'); return; }
    stopSpeech(); const recognition = new Recognition(); recognition.lang = 'de-DE'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setSpeakingState('listening'); recognition.onresult = (event) => { setTranscript(event.results[0][0].transcript); setSpeakingState('heard'); }; recognition.onerror = () => setSpeakingState('heard'); recognition.onend = () => setSpeakingState((current) => current === 'listening' ? 'heard' : current); recognitionRef.current = recognition; recognition.start();
  };
  const toggleTheme = () => setTheme((current) => { const nextTheme = current === 'dark' ? 'light' : 'dark'; localStorage.setItem('zurich_theme', nextTheme); return nextTheme; });
  const finishTask = () => { completeModule1Lesson('finding-products'); setTaskDone(true); };

  const renderStep = () => {
    switch (step) {
      case 0: return <><div className="lesson-flow-kicker">LESSON 1 · FINDING PRODUCTS</div><div className="lesson-flow-hero-mark"><span className="lesson-flow-icon">⌂</span></div><h1>Find your way around the shop.</h1><p className="lesson-flow-lede">Learn a small complete interaction: get someone’s attention, ask where something is, understand the answer and say thanks.</p><div className="lesson-flow-context"><span>Today at Migros or Coop</span><strong>{PHRASE}</strong><small>About 5–7 minutes</small></div><button className="lesson-flow-primary" type="button" onClick={next}>Begin lesson <span>→</span></button></>;
      case 1: return <><div className="lesson-flow-kicker">START THE INTERACTION</div><h1>Get their attention first.</h1><p className="lesson-flow-lede">These four words help you ask clearly without needing a long explanation.</p><div className="lesson-flow-word-list">{WORDS.map(([word, meaning, note]) => <div className="lesson-flow-word" key={word}><div><strong lang="de">{word}</strong><span>{meaning}</span><small>{note}</small></div><button type="button" aria-label={`Listen to ${word}`} onClick={() => listen(word)}>▶</button></div>)}</div><button className="lesson-flow-primary" type="button" onClick={next}>I’m ready <span>→</span></button></>;
      case 2: return <><div className="lesson-flow-kicker">ASK IN DIFFERENT WAYS</div><h1>One pattern, many products.</h1><p className="lesson-flow-lede">The question stays almost the same. Only the product or place changes.</p><div className="lesson-flow-phrase-card"><p lang="de">{PHRASE}</p><ListenButton onClick={() => listen()} /><div className="lesson-flow-translation">Excuse me, where can I find the oat milk?</div></div><div className="lesson-flow-variations">{VARIATIONS.map((variation) => <button type="button" key={variation} onClick={() => listen(variation)}><span lang="de">{variation}</span><small>▶</small></button>)}</div><button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button></>;
      case 3: return <><div className="lesson-flow-kicker">UNDERSTAND THE ANSWER</div><h1>Where should you go?</h1><p className="lesson-flow-lede">Listen to the direction and choose the meaning.</p><div className="lesson-flow-listen-stage"><ListenButton label="Play direction" onClick={() => listen(DIRECTIONS[0][0])} /></div><div className="lesson-flow-options">{DIRECTIONS.map(([german, english], index) => <button className={directionChoice === index ? 'selected' : ''} type="button" key={german} onClick={() => setDirectionChoice(index)}><span lang="de">{german}</span><small>{english}</small></button>)}</div>{directionChoice !== null && <p className={`lesson-flow-feedback ${directionCorrect ? 'good' : 'try'}`}>{directionCorrect ? 'Yes — “im nächsten Gang” means the next aisle.' : 'Listen for “Gang”. Try again.'}</p>}{directionCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 4: return <><div className="lesson-flow-kicker">PUT IT TOGETHER</div><h1>Build the question.</h1><p className="lesson-flow-lede">Choose the next word. This is for speaking, not for memorising grammar rules.</p><div className="lesson-flow-built-sentence" aria-live="polite">{order.length ? order.join(' ') : 'Choose a word below'}</div><div className="lesson-flow-token-grid">{remainingWords.map((word) => <button key={word} type="button" onClick={() => chooseOrderWord(word)}>{word}</button>)}</div>{orderError && <p className="lesson-flow-feedback try">Start with the polite opener: <strong>Entschuldigung,</strong></p>}{orderComplete && <p className="lesson-flow-feedback good">Good. That is a question you can use.</p>}{orderComplete && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 5: return <><div className="lesson-flow-kicker">HEAR IT IN THE SHOP</div><h1>Which question did you hear?</h1><p className="lesson-flow-lede">Listen once, then notice what the shopper is trying to find.</p><div className="lesson-flow-listen-stage"><ListenButton label="Play shop question" onClick={() => listen('Wo gibt es Reis?')} /></div><div className="lesson-flow-options listening-options"><button className={listeningChoice === 0 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(0)} lang="de">Wo gibt es Reis?</button><button className={listeningChoice === 1 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(1)} lang="de">Wo ist die Kasse?</button><button className={listeningChoice === 2 ? 'selected' : ''} type="button" onClick={() => setListeningChoice(2)} lang="de">Haben Sie Hafermilch?</button></div>{listeningChoice !== null && <p className={`lesson-flow-feedback ${listeningCorrect ? 'good' : 'try'}`}>{listeningCorrect ? 'That’s it — “Wo gibt es …?” is another way to ask where something is.' : 'Listen for the product word and try again.'}</p>}{listeningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 6: return <><div className="lesson-flow-kicker">CLOSE NATURALLY</div><h1>What do you say next?</h1><p className="lesson-flow-lede">You do not need a long reply. A short thank-you keeps the interaction natural.</p><div className="lesson-flow-options"><button className={responseChoice === 0 ? 'selected' : ''} type="button" onClick={() => setResponseChoice(0)} lang="de">Ah, danke.</button><button className={responseChoice === 1 ? 'selected' : ''} type="button" onClick={() => setResponseChoice(1)} lang="de">Super, danke schön.</button><button className={responseChoice === 2 ? 'selected' : ''} type="button" onClick={() => setResponseChoice(2)} lang="de">Gültig bis Freitag.</button></div>{responseChoice !== null && <p className={`lesson-flow-feedback ${responseCorrect ? 'good' : 'try'}`}>{responseCorrect ? 'Yes — both short thank-yous close the interaction naturally.' : 'Choose a short thank-you.'}</p>}{responseCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 7: return <><div className="lesson-flow-kicker">SAY IT ONCE</div><h1>Now ask it yourself.</h1><p className="lesson-flow-lede">Say the sentence out loud. Aim for clear and polite, not perfect.</p><div className="lesson-flow-speak-card"><p lang="de">{PHRASE}</p><button className={`lesson-flow-mic${speakingState === 'listening' ? ' listening' : ''}`} type="button" onClick={startSpeaking}><span aria-hidden="true">{speakingState === 'listening' ? '●' : '◉'}</span>{speakingState === 'listening' ? 'Listening…' : 'Tap, then speak'}</button>{transcript && <small>Heard: “{transcript}”</small>}</div><p className="lesson-flow-note">Speech recognition is only light feedback. You can continue even if your browser does not hear you.</p>{speakingState === 'heard' && <button className="lesson-flow-primary" type="button" onClick={next}>I said it <span>→</span></button>}</>;
      case 8: return <><div className="lesson-flow-kicker">A ZURICH TIP</div><h1>Listen for the place word.</h1><div className="lesson-flow-tip-card"><span className="lesson-flow-icon">↗</span><p>Directions may be very short: <strong lang="de">Da vorne</strong>, <strong lang="de">hinten links</strong>, <strong lang="de">neben der Kasse</strong>. You only need to catch the useful place word.</p></div><p className="lesson-flow-note">One question and one “Danke” is enough for today.</p><button className="lesson-flow-primary" type="button" onClick={next}>Finish lesson <span>→</span></button></>;
      case 9: return <><div className="lesson-flow-kicker">LESSON COMPLETE</div><div className="lesson-flow-complete-mark"><span className="lesson-flow-icon">✓</span></div><h1>Take it to the shop.</h1><p className="lesson-flow-lede">You now have a small supermarket interaction, not just one sentence.</p><div className="lesson-flow-task-card"><small>REAL-WORLD TASK</small><strong>Ask where one product is at Migros or Coop.</strong><span lang="de">„Entschuldigung, wo finde ich die Hafermilch?“</span></div>{!taskDone ? <button className="lesson-flow-primary" type="button" onClick={finishTask}>I’ll try this <span>→</span></button> : <div className="lesson-flow-task-done">Task saved for this week.</div>}<Link className="lesson-flow-back" to="/">Back to Module 1</Link></>;
      default: return null;
    }
  };

  return <div className={`lesson-flow-page theme-${theme}`}><div className="lesson-flow-appbar"><Link to="/" className="lesson-flow-back-arrow" aria-label="Back to Module 1">‹</Link><span>Module 1 · Migros &amp; Coop</span><span className="lesson-flow-appbar-spacer" /><button className="lesson-flow-theme" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☼' : '☾'}</button></div><main className="lesson-flow"><ProgressHeader step={step} total={totalSteps} /><section className="lesson-flow-card" aria-live="polite">{renderStep()}</section>{step > 0 && step < totalSteps - 1 && <button className="lesson-flow-secondary" type="button" onClick={back}>Back</button>}</main></div>;
}
