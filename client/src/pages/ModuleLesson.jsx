import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { detectTtsEngines, speak, stopSpeech } from '../speech.js';
import { completeModule1Lesson, completeModule1Mission, readModule1Progress } from '../data/module1.js';

const LESSONS = {
  'aktion-price-tags': {
    progressId: 'aktion-price-tags',
    kicker: 'LESSON 2 · DISCOUNTS & AKTION',
    title: 'Spot a good deal.',
    intro: 'Swiss supermarkets have their own language for offers, markdowns, and the things that disappear first.',
    icon: '%',
    context: 'Read the orange signs',
    duration: 'About 8 minutes',
    words: [
      ['die Aktion', 'special offer', 'Aktion heute — offer today'],
      ['reduziert', 'reduced', 'Ist das reduziert? — Is it reduced?'],
      ['das Angebot', 'offer', 'im Angebot — on special offer'],
      ['der Preis', 'price', 'Wie viel kostet das? — How much is it?'],
    ],
    phrase: 'Ist das reduziert?',
    translation: 'Is this reduced?',
    note: 'In Switzerland, you will also hear “Aktion” on a shelf sign. It usually means a special offer, not a question.',
    meaning: [
      ['reduced', 'Is this reduced?'],
      ['price', 'How much is this?'],
      ['fresh', 'Is this fresh?'],
    ],
    meaningAnswer: 0,
    order: ['Ist', 'das', 'reduziert?'],
    listening: ['Ist das reduziert?', 'Ist das frisch?', 'Wie viel kostet das?'],
    listeningAnswer: 0,
    tipTitle: '“Aktion” is your shortcut.',
    tip: 'When you see Aktion, look at the old and new price. The smaller orange sign is often the fastest way to spot a deal.',
    task: 'Ask one question in German about a reduced product this week.',
  },
  checkout: {
    progressId: 'checkout',
    kicker: 'LESSON 3 · CHECKOUT',
    title: 'Handle the checkout.',
    intro: 'The till is quick, practical, and predictable once you know the few phrases that come up every time.',
    icon: '▣',
    context: 'Answer at the till',
    duration: 'About 8 minutes',
    words: [
      ['die Kasse', 'checkout / till', 'an der Kasse — at the checkout'],
      ['bezahlen', 'to pay', 'Ich möchte bezahlen — I would like to pay'],
      ['bar', 'cash', 'bar bezahlen — pay in cash'],
      ['die Karte', 'card', 'mit Karte — by card'],
    ],
    phrase: 'Bar oder Karte?',
    translation: 'Cash or card?',
    note: 'The cashier may ask this very quickly. A simple “Mit Karte, bitte” is a complete answer.',
    meaning: [
      ['cash or card?', 'Cash or card?'],
      ['do you need a bag?', 'Do you need a bag?'],
      ['do you have points?', 'Do you have points?'],
    ],
    meaningAnswer: 0,
    order: ['Bar', 'oder', 'Karte?'],
    listening: ['Bar oder Karte?', 'Brot oder Käse?', 'Eine Tasche, bitte?'],
    listeningAnswer: 0,
    tipTitle: 'Bring your own rhythm.',
    tip: 'At many Swiss checkouts, pack your groceries while the cashier scans. “Mit Karte, bitte” keeps the conversation simple and clear.',
    task: 'Answer one checkout question in German this week: “Mit Karte, bitte.”',
  },
  'cumulus-supercard': {
    progressId: 'cumulus-supercard',
    kicker: 'LESSON 4 · CUMULUS & SUPERCARD',
    title: 'Handle loyalty points.',
    intro: 'Migros has Cumulus. Coop has Supercard. You only need a few words to decide what you want at the till.',
    icon: '✦',
    context: 'Choose your answer',
    duration: 'About 8 minutes',
    words: [
      ['die Punkte', 'points', 'Cumulus-Punkte — Cumulus points'],
      ['die Karte', 'card', 'Haben Sie Ihre Karte? — Do you have your card?'],
      ['die App', 'app', 'Ich habe die App. — I have the app.'],
      ['der Kassenbon', 'receipt', 'Möchten Sie den Kassenbon? — Do you want the receipt?'],
    ],
    phrase: 'Möchten Sie Cumulus-Punkte?',
    translation: 'Would you like Cumulus points?',
    note: 'You can answer “Ja, bitte” or “Nein, danke.” Both are natural and polite.',
    meaning: [
      ['Would you like Cumulus points?', 'Would you like Cumulus points?'],
      ['Do you want a paper bag?', 'Do you want a paper bag?'],
      ['Can you pay here?', 'Can you pay here?'],
    ],
    meaningAnswer: 0,
    order: ['Ja,', 'bitte.', 'Ich', 'habe', 'die', 'App.'],
    listening: ['Möchten Sie Cumulus-Punkte?', 'Möchten Sie den Kassenbon?', 'Haben Sie Kleingeld?'],
    listeningAnswer: 0,
    tipTitle: '“Ja, bitte” is enough.',
    tip: 'You do not need to explain your loyalty account. At the till, a short answer is normal: “Ja, bitte” or “Nein, danke.”',
    task: 'Answer one loyalty-points question in German this week.',
  },
  'fruit-bags-receipts': {
    progressId: 'fruit-bags-receipts',
    kicker: 'LESSON 5 · FRUIT, BAGS & RECEIPTS',
    title: 'Read the small signals.',
    intro: 'Produce scales, bags, receipts and signs become much easier when you know the few words you will hear most often.',
    icon: '▤',
    context: 'Keep your shop moving',
    duration: 'About 8 minutes',
    words: [
      ['die Waage', 'scale', 'auf der Waage — on the scale'],
      ['die Tasche', 'bag', 'Brauchen Sie eine Tasche? — Do you need a bag?'],
      ['der Kassenbon', 'receipt', 'der Kassenbon — the receipt'],
      ['wiegen', 'to weigh', 'Das Gemüse wiegen — weigh the vegetables'],
    ],
    phrase: 'Brauchen Sie eine Tasche?',
    translation: 'Do you need a bag?',
    note: 'You may be asked this at the checkout. “Nein, danke” is a natural answer if you brought your own bag.',
    meaning: [
      ['Do you need a bag?', 'Do you need a bag?'],
      ['Where is the scale?', 'Where is the scale?'],
      ['Would you like the receipt?', 'Would you like the receipt?'],
    ],
    meaningAnswer: 0,
    order: ['Brauchen', 'Sie', 'eine', 'Tasche?'],
    listening: ['Brauchen Sie eine Tasche?', 'Brauchen Sie eine Karte?', 'Haben Sie eine Tasche?'],
    listeningAnswer: 0,
    tipTitle: 'Weigh loose produce first.',
    tip: 'At many Swiss supermarkets, weigh fruit and vegetables in the produce area, then attach the printed label before checkout.',
    task: 'Answer one bag question in German this week.',
  },
  mission: {
    progressId: 'migros-real-life-mission',
    kicker: 'REAL-LIFE MISSION · MIGROS & COOP',
    title: 'Do one shop in German.',
    intro: 'Take one small question from this module into a real supermarket visit. Keep it simple: greet, ask, listen, thank.',
    icon: '↗',
    context: 'A small real-world challenge',
    duration: 'About 8 minutes',
    words: [
      ['Grüezi', 'hello', 'A polite Swiss greeting'],
      ['Entschuldigung', 'excuse me', 'A polite way to get attention'],
      ['können Sie …?', 'can you …?', 'Können Sie mir helfen? — Can you help me?'],
      ['Danke', 'thank you', 'Danke vielmals — thanks a lot'],
    ],
    phrase: 'Entschuldigung, wo finde ich das Brot?',
    translation: 'Excuse me, where can I find the bread?',
    note: 'You do not need a long conversation. One clear question, one reply, and one “Danke” is a successful supermarket trip.',
    meaning: [
      ['Excuse me, where can I find the bread?', 'Excuse me, where can I find the bread?'],
      ['Can I pay by card?', 'Can I pay by card?'],
      ['Where is the exit?', 'Where is the exit?'],
    ],
    meaningAnswer: 0,
    order: ['Entschuldigung,', 'wo', 'finde', 'ich', 'das', 'Brot?'],
    listening: ['Entschuldigung, wo finde ich das Brot?', 'Entschuldigung, ist das reduziert?', 'Danke, gleichfalls.'],
    listeningAnswer: 0,
    tipTitle: 'Small questions count.',
    tip: 'In Zurich, one clear question is a successful conversation. You do not need to understand every reply to have made progress.',
    task: 'Do one supermarket trip partly in German.',
  },
};

function ListenButton({ onClick, label = 'Listen' }) {
  return <button className="lesson-flow-listen" type="button" onClick={onClick}><span aria-hidden="true">▶</span> {label}</button>;
}

export default function ModuleLesson() {
  const { slug } = useParams();
  const lesson = LESSONS[slug];
  if (!lesson) return <Navigate to="/" replace />;
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

  const phrase = lesson.phrase;
  const remainingWords = useMemo(() => lesson.order.filter((word) => !order.includes(word)), [lesson.order, order]);
  const meaningCorrect = meaningChoice === lesson.meaningAnswer;
  const listeningCorrect = listeningChoice === lesson.listeningAnswer;
  const orderComplete = order.length === lesson.order.length;

  useEffect(() => {
    detectTtsEngines().finally(() => setTtsReady(true));
    const progress = readModule1Progress();
    setTaskDone(slug === 'mission'
      ? progress.missionTried
      : progress.completedLessons.includes(lesson.progressId));
    return () => {
      stopSpeech();
      recognitionRef.current?.stop?.();
    };
  }, [slug]);

  const listen = async (text = phrase) => {
    if (!ttsReady) await detectTtsEngines();
    stopSpeech();
    speak(text, { lang: 'de', rate: 0.88 });
  };

  const next = () => { stopSpeech(); setStep((current) => Math.min(totalSteps - 1, current + 1)); };
  const back = () => { stopSpeech(); setStep((current) => Math.max(0, current - 1)); };

  const chooseOrderWord = (word) => {
    if (word === lesson.order[order.length]) {
      setOrder((current) => [...current, word]);
      setOrderError(false);
    } else {
      setOrderError(true);
    }
  };

  const startSpeaking = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setSpeakingState('heard'); return; }
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

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('zurich_theme', nextTheme);
      return nextTheme;
    });
  };

  const finishTask = () => {
    if (slug === 'mission') completeModule1Mission();
    else completeModule1Lesson(lesson.progressId);
    setTaskDone(true);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <><div className="lesson-flow-kicker">{lesson.kicker}</div><div className="lesson-flow-hero-mark"><span className="lesson-flow-icon">{lesson.icon}</span></div><h1>{lesson.title}</h1><p className="lesson-flow-lede">{lesson.intro}</p><div className="lesson-flow-context"><span>{lesson.context}</span><strong>{phrase}</strong><small>{lesson.duration}</small></div><button className="lesson-flow-primary" type="button" onClick={next}>Begin lesson <span>→</span></button></>;
      case 1:
        return <><div className="lesson-flow-kicker">A FEW WORDS FIRST</div><h1>The words you’ll need.</h1><p className="lesson-flow-lede">Tap the speaker when you want to hear one again. You do not need to memorise everything.</p><div className="lesson-flow-word-list">{lesson.words.map(([word, meaning, note]) => <div className="lesson-flow-word" key={word}><div><strong lang="de">{word}</strong><span>{meaning}</span><small>{note}</small></div><button type="button" aria-label={`Listen to ${word}`} onClick={() => listen(word)}>▶</button></div>)}</div><button className="lesson-flow-primary" type="button" onClick={next}>I’m ready <span>→</span></button></>;
      case 2:
        return <><div className="lesson-flow-kicker">THE REAL SENTENCE</div><h1>Here is the question.</h1><p className="lesson-flow-lede">This is a sentence you can use today, exactly as it is.</p><div className="lesson-flow-phrase-card"><p lang="de">{phrase}</p><ListenButton onClick={() => listen()} /><div className="lesson-flow-translation">{lesson.translation}</div></div><p className="lesson-flow-note">{lesson.note}</p><button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button></>;
      case 3:
        return <><div className="lesson-flow-kicker">CHECK THE MEANING</div><h1>What are you asking?</h1><div className="lesson-flow-prompt" lang="de">{phrase}</div><div className="lesson-flow-options">{lesson.meaning.map(([label], index) => <button className={meaningChoice === index ? 'selected' : ''} type="button" key={label} onClick={() => setMeaningChoice(index)}>{label}</button>)}</div>{meaningChoice !== null && <p className={`lesson-flow-feedback ${meaningCorrect ? 'good' : 'try'}`}>{meaningCorrect ? 'Yes — you understood the question.' : 'Not quite. Listen again and try once more.'}</p>}{meaningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 4:
        return <><div className="lesson-flow-kicker">PUT IT TOGETHER</div><h1>Build the question.</h1><p className="lesson-flow-lede">Choose the next word. Take your time.</p><div className="lesson-flow-built-sentence" aria-live="polite">{order.length ? order.join(' ') : 'Choose a word below'}</div><div className="lesson-flow-token-grid">{remainingWords.map((word) => <button key={word} type="button" onClick={() => chooseOrderWord(word)}>{word}</button>)}</div>{orderError && <p className="lesson-flow-feedback try">Try the beginning again and follow the sentence rhythm.</p>}{orderComplete && <p className="lesson-flow-feedback good">Good. That is the sentence you need.</p>}{orderComplete && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 5:
        return <><div className="lesson-flow-kicker">LISTEN FOR THE SHAPE</div><h1>Which sentence did you hear?</h1><p className="lesson-flow-lede">Listen once, then choose the sentence that matches.</p><div className="lesson-flow-listen-stage"><ListenButton label="Play sentence" onClick={() => listen()} /></div><div className="lesson-flow-options listening-options">{lesson.listening.map((option, index) => <button className={listeningChoice === index ? 'selected' : ''} type="button" key={option} onClick={() => setListeningChoice(index)}>{option}</button>)}</div>{listeningChoice !== null && <p className={`lesson-flow-feedback ${listeningCorrect ? 'good' : 'try'}`}>{listeningCorrect ? 'That’s it. You heard the question shape.' : 'Listen once more and try again.'}</p>}{listeningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 6:
        return <><div className="lesson-flow-kicker">SAY IT ONCE</div><h1>Now ask it yourself.</h1><p className="lesson-flow-lede">Say the sentence out loud. Aim for clear and polite, not perfect.</p><div className="lesson-flow-speak-card"><p lang="de">{phrase}</p><button className={`lesson-flow-mic${speakingState === 'listening' ? ' listening' : ''}`} type="button" onClick={startSpeaking}><span aria-hidden="true">{speakingState === 'listening' ? '●' : '◉'}</span>{speakingState === 'listening' ? 'Listening…' : 'Tap, then speak'}</button>{transcript && <small>Heard: “{transcript}”</small>}</div><p className="lesson-flow-note">If your browser cannot use the microphone, simply say it once and tap the button again.</p>{speakingState === 'heard' && <button className="lesson-flow-primary" type="button" onClick={next}>I said it <span>→</span></button>}</>;
      case 7:
        return <><div className="lesson-flow-kicker">A ZURICH TIP</div><h1>{lesson.tipTitle}</h1><div className="lesson-flow-tip-card"><span className="lesson-flow-icon">↗</span><p>{lesson.tip}</p></div><p className="lesson-flow-note">One clear question is enough for today.</p><button className="lesson-flow-primary" type="button" onClick={next}>Finish lesson <span>→</span></button></>;
      case 8:
        return <><div className="lesson-flow-kicker">LESSON COMPLETE</div><div className="lesson-flow-complete-mark"><span className="lesson-flow-icon">✓</span></div><h1>Take it into the shop.</h1><p className="lesson-flow-lede">You now have one useful phrase for a real Zurich supermarket.</p><div className="lesson-flow-task-card"><small>REAL-WORLD TASK</small><strong>{lesson.task}</strong><span lang="de">„{phrase}“</span></div>{!taskDone ? <button className="lesson-flow-primary" type="button" onClick={finishTask}>I’ll try this <span>→</span></button> : <div className="lesson-flow-task-done">Task saved for this week.</div>}<Link className="lesson-flow-back" to="/">Back to Module 1</Link></>;
      default:
        return null;
    }
  };

  return <div className={`lesson-flow-page theme-${theme}`}>
    <div className="lesson-flow-appbar"><Link to="/" className="lesson-flow-back-arrow" aria-label="Back to Module 1">‹</Link><span>Module 1 · Migros &amp; Coop</span><span className="lesson-flow-appbar-spacer" /><button className="lesson-flow-theme" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☼' : '☾'}</button></div>
    <main className="lesson-flow"><div className="lesson-flow-progress" aria-label={`Lesson step ${step + 1} of ${totalSteps}`}><div className="lesson-flow-progress-track"><span style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} /></div><span>{step + 1} / {totalSteps}</span></div><section className="lesson-flow-card" aria-live="polite">{renderStep()}</section>{step > 0 && step < totalSteps - 1 && <button className="lesson-flow-secondary" type="button" onClick={back}>Back</button>}</main>
  </div>;
}
