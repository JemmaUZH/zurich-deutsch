import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { detectTtsEngines, speak, stopSpeech } from '../speech.js';
import { completeModule1Lesson, readModule1Progress } from '../data/module1.js';

const LESSONS = {
  'aktion-price-tags': {
    progressId: 'aktion-price-tags', kicker: 'LESSON 2 · AKTION & PRICE TAGS', title: 'Read a good deal.',
    intro: 'Learn the short words that help you understand a Swiss shelf label before you put something in your basket.', icon: '%', context: 'Read the orange signs', duration: 'About 5–7 minutes',
    words: [
      ['die Aktion', 'special offer', 'AKTION — a special offer'], ['reduziert', 'reduced', '-50% reduziert — reduced by 50%'], ['das Angebot', 'offer', 'im Angebot — on special offer'], ['statt', 'instead of / formerly', 'statt 4.95 — formerly 4.95'], ['jetzt', 'now', 'jetzt 2.95 — now 2.95'], ['pro Stück', 'per item', 'CHF 3.20 pro Stück — per item'], ['pro kg', 'per kilogram', 'CHF 2.90 pro kg — per kilogram'], ['pro 100 g', 'per 100 grams', 'CHF 1.20 pro 100 g'], ['gültig bis', 'valid until', 'gültig bis Freitag — valid until Friday'], ['ausverkauft', 'sold out', 'Das ist ausverkauft — That is sold out'],
    ],
    phrase: 'Ist das reduziert?', translation: 'Is this reduced?', variations: ['Wie viel kostet das?', 'Gilt die Aktion auch heute?'], heardPhrase: 'Ist das reduziert?',
    note: '“Aktion” usually means a special offer on a shelf sign. It is not a question by itself.',
    meaning: [['Is this reduced?'], ['How much is this?'], ['Is this fresh?']], meaningAnswer: 0,
    labels: [{ lines: ['AKTION', 'statt 4.95', 'jetzt 2.95'], answer: 'The new price is CHF 2.95.', correct: true }, { lines: ['CHF 3.20', 'pro Stück'], answer: 'The price is CHF 3.20 per item.', correct: false }, { lines: ['-50%', 'reduziert'], answer: 'The item is reduced by 50%.', correct: false }], labelAnswer: 0,
    listening: ['Ist das reduziert?', 'Gilt die Aktion auch heute?', 'Wie viel kostet das?'], listeningAnswer: 0,
    responses: ['Ja, es ist reduziert.', 'Nein, danke.', 'Mit Karte, bitte.'], responseAnswer: 0, order: ['Gilt', 'die', 'Aktion', 'auch', 'heute?'],
    tipTitle: 'Read the new price first.', tip: 'On a Swiss shelf label, “statt” is the old price and “jetzt” is the price you pay now. Check “pro kg” or “pro 100 g” when comparing sizes.', task: 'Ask one question in German about a reduced product this week.',
  },
  checkout: {
    progressId: 'checkout', kicker: 'LESSON 3 · CHECKOUT', title: 'Keep the checkout moving.',
    intro: 'Cashiers often speak in short, practical phrases. Learn to recognise the question and answer without overthinking it.', icon: '▣', context: 'Answer at the till', duration: 'About 5–7 minutes',
    words: [
      ['bar', 'cash', 'bar bezahlen — pay in cash'], ['die Karte', 'card', 'mit Karte — by card'], ['die Kasse', 'checkout / till', 'an der Kasse — at the checkout'], ['bezahlen', 'to pay', 'Ich möchte bezahlen — I would like to pay'], ['die Tasche', 'bag', 'Brauchen Sie eine Tasche? — Do you need a bag?'], ['der Kassenzettel', 'receipt', 'Möchten Sie einen Kassenzettel? — Do you want a receipt?'], ['zusammen', 'together', 'Zusammen, bitte. — Together, please.'], ['getrennt', 'separately', 'Getrennt, bitte. — Separately, please.'],
    ],
    phrase: 'Bar oder Karte?', translation: 'Cash or card?', variations: ['Mit Karte, bitte.', 'Zusammen, bitte.', 'Getrennt, bitte.'], heardPhrase: 'Karte?',
    note: 'Real checkout German is often shorter than textbook German. “Karte?” can mean “Cash or card?” in context.', meaning: [['Cash or card?'], ['Do you need a bag?'], ['Do you have points?']], meaningAnswer: 0,
    listening: ['Karte?', 'Brauchen Sie eine Tasche?', 'Möchten Sie einen Kassenzettel?'], listeningAnswer: 0, responses: ['Mit Karte, bitte.', 'Ich habe keine Tasche.', 'Gültig bis Freitag.'], responseAnswer: 0, order: ['Mit', 'Karte,', 'bitte.'],
    tipTitle: 'Short answers are natural.', tip: 'Pack your groceries while the cashier scans. A simple “Mit Karte, bitte” or “Nein, danke” is enough.', task: 'Answer one checkout question in German this week.',
  },
  'cumulus-supercard': {
    progressId: 'cumulus-supercard', kicker: 'LESSON 4 · CUMULUS & SUPERCARD', title: 'Handle the loyalty question.',
    intro: 'Migros has Cumulus and Coop has Supercard. You only need a few calm responses at the till.', icon: '✦', context: 'Choose your answer', duration: 'About 5–7 minutes',
    words: [
      ['die Punkte', 'points', 'Punkte sammeln — collect points'], ['die Karte', 'card', 'Haben Sie eine Karte? — Do you have a card?'], ['die App', 'app', 'Ich habe die App. — I have the app.'], ['sammeln', 'to collect', 'Punkte sammeln — collect points'], ['digital', 'digital', 'den Bon digital — the digital receipt'], ['der Bon', 'receipt', 'Möchten Sie den Bon? — Do you want the receipt?'], ['der Kassenzettel', 'paper receipt', 'der Kassenzettel — the paper receipt'], ['einen Moment', 'one moment', 'Ja, einen Moment. — Yes, one moment.'],
    ],
    phrase: 'Haben Sie Cumulus?', translation: 'Do you have Cumulus?', variations: ['Haben Sie eine Supercard?', 'Möchten Sie Punkte sammeln?', 'Haben Sie die App?', 'Möchten Sie den Bon digital?'], heardPhrase: 'Cumulus?',
    note: 'The cashier may only say “Cumulus?” or “Supercard?”. The short question is still easy to answer.', meaning: [['Do you have Cumulus?'], ['Do you need a bag?'], ['Can you pay here?']], meaningAnswer: 0,
    listening: ['Cumulus?', 'Möchten Sie den Bon digital?', 'Haben Sie die App?'], listeningAnswer: 0, responses: ['Ja, einen Moment.', 'Ich habe keine Karte.', 'Zusammen, bitte.'], responseAnswer: 0, order: null,
    tipTitle: 'You can keep it brief.', tip: 'You do not need to explain your loyalty account. “Ja, einen Moment”, “Ich habe die App” or “Nein, danke” are complete answers.', task: 'Answer one loyalty-card question in German this week.',
  },
  'fruit-bags-receipts': {
    progressId: 'fruit-bags-receipts', kicker: 'LESSON 5 · FRUIT, BAGS & RECEIPTS', title: 'Read the small signals.',
    intro: 'Combine the signs you see around produce with the short questions you hear at the checkout.', icon: '▤', context: 'Keep your shop moving', duration: 'About 5–7 minutes',
    words: [
      ['das Obst', 'fruit', 'Obst und Gemüse — fruit and vegetables'], ['das Gemüse', 'vegetables', 'frisches Gemüse — fresh vegetables'], ['wiegen', 'to weigh', 'Das Gemüse wiegen — weigh the vegetables'], ['die Waage', 'scale', 'auf der Waage — on the scale'], ['die Artikelnummer', 'item number', 'Artikelnummer eingeben — enter item number'], ['das Etikett', 'label', 'ein Etikett drucken — print a label'], ['die Kasse', 'checkout', 'zur Kasse — to the checkout'], ['der Eingang', 'entrance', 'Eingang — entrance'], ['der Ausgang', 'exit', 'Ausgang — exit'], ['der Kassenzettel', 'receipt', 'Möchten Sie einen Kassenzettel? — Do you want a receipt?'],
    ],
    phrase: 'Brauchen Sie eine Tasche?', translation: 'Do you need a bag?', variations: ['Möchten Sie einen Bon?', 'Wo kann ich das wiegen?', 'Ich habe eine Tasche.'], heardPhrase: 'Brauchen Sie eine Tasche?',
    note: 'A reusable bag is often called a “Tasche”. You can answer “Nein, danke” if you brought your own.', meaning: [['Do you need a bag?'], ['Where is the scale?'], ['Would you like the receipt?']], meaningAnswer: 0,
    labels: [{ lines: ['OBST', 'GEMÜSE'], answer: 'Fruit and vegetables', correct: false }, { lines: ['EINGANG', '→'], answer: 'Entrance', correct: false }, { lines: ['AUSGANG', '←'], answer: 'Exit', correct: true }, { lines: ['WAAGE', 'Artikelnummer'], answer: 'Scale and item number', correct: false }], labelAnswer: 2,
    listening: ['Brauchen Sie eine Tasche?', 'Möchten Sie einen Bon?', 'Wo kann ich das wiegen?'], listeningAnswer: 0, responses: ['Nein, danke.', 'Gültig bis Freitag.', 'Ich habe keine Karte.'], responseAnswer: 0, order: ['Wo', 'kann', 'ich', 'das', 'wiegen?'],
    tipTitle: 'Weigh loose produce first.', tip: 'In many Swiss supermarkets, weigh fruit and vegetables in the produce area, then attach the printed label before checkout.', task: 'Answer one bag or receipt question in German this week.',
  },
};

const LESSON_PATHS = {
  '/module-1/aktion-price-tags': 'aktion-price-tags', '/module-1/checkout': 'checkout', '/module-1/cumulus-supercard': 'cumulus-supercard', '/module-1/fruit-bags-receipts': 'fruit-bags-receipts',
};

function ListenButton({ onClick, label = 'Listen' }) {
  return <button className="lesson-flow-listen" type="button" onClick={onClick}><span aria-hidden="true">▶</span> {label}</button>;
}

function ProgressHeader({ step, total }) {
  return <div className="lesson-flow-progress" aria-label={`Lesson step ${step + 1} of ${total}`}><div className="lesson-flow-progress-track"><span style={{ width: `${(step / (total - 1)) * 100}%` }} /></div><span>{step + 1} / {total}</span></div>;
}

export default function ModuleLesson() {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const slug = paramSlug || LESSON_PATHS[location.pathname];
  const lesson = LESSONS[slug];
  const [step, setStep] = useState(0);
  const [meaningChoice, setMeaningChoice] = useState(null);
  const [order, setOrder] = useState([]);
  const [orderError, setOrderError] = useState(false);
  const [listeningChoice, setListeningChoice] = useState(null);
  const [responseChoice, setResponseChoice] = useState(null);
  const [labelChoice, setLabelChoice] = useState(null);
  const [wordPage, setWordPage] = useState(0);
  const [speakingState, setSpeakingState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [taskDone, setTaskDone] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('zurich_theme') || 'system');
  const recognitionRef = useRef(null);
  const totalSteps = 10;
  const phrase = lesson?.phrase || '';
  const remainingWords = useMemo(() => lesson?.order?.filter((word) => !order.includes(word)) || [], [lesson, order]);
  const meaningCorrect = meaningChoice === lesson?.meaningAnswer;
  const listeningCorrect = listeningChoice === lesson?.listeningAnswer;
  const responseCorrect = responseChoice === lesson?.responseAnswer;
  const labelCorrect = labelChoice === lesson?.labelAnswer;
  const orderComplete = lesson?.order ? order.length === lesson.order.length : true;
  const wordPages = lesson ? Math.ceil(lesson.words.length / 5) : 1;
  const visibleWords = lesson ? lesson.words.slice(wordPage * 5, wordPage * 5 + 5) : [];

  useEffect(() => {
    if (!lesson) return undefined;
    detectTtsEngines().finally(() => setTtsReady(true));
    const progress = readModule1Progress();
    setTaskDone(progress.completedLessons.includes(lesson.progressId));
    setWordPage(0);
    return () => { stopSpeech(); recognitionRef.current?.stop?.(); };
  }, [lesson]);

  if (!lesson) return <Navigate to="/" replace />;

  const listen = async (text = phrase) => { if (!ttsReady) await detectTtsEngines(); stopSpeech(); speak(text, { lang: 'de', rate: 0.88 }); };
  const next = () => { stopSpeech(); setStep((current) => Math.min(totalSteps - 1, current + 1)); };
  const back = () => { stopSpeech(); setStep((current) => Math.max(0, current - 1)); };
  const chooseOrderWord = (word) => { if (word === lesson.order[order.length]) { setOrder((current) => [...current, word]); setOrderError(false); } else setOrderError(true); };
  const startSpeaking = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setSpeakingState('heard'); return; }
    stopSpeech(); const recognition = new Recognition(); recognition.lang = 'de-DE'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setSpeakingState('listening'); recognition.onresult = (event) => { setTranscript(event.results[0][0].transcript); setSpeakingState('heard'); }; recognition.onerror = () => setSpeakingState('heard'); recognition.onend = () => setSpeakingState((current) => current === 'listening' ? 'heard' : current); recognitionRef.current = recognition; recognition.start();
  };
  const toggleTheme = () => setTheme((current) => { const nextTheme = current === 'dark' ? 'light' : 'dark'; localStorage.setItem('zurich_theme', nextTheme); return nextTheme; });
  const finishTask = () => { completeModule1Lesson(lesson.progressId); setTaskDone(true); };
  const advanceWords = () => { if (wordPage < wordPages - 1) setWordPage((current) => current + 1); else next(); };

  const renderStep = () => {
    switch (step) {
      case 0: return <><div className="lesson-flow-kicker">{lesson.kicker}</div><div className="lesson-flow-hero-mark"><span className="lesson-flow-icon">{lesson.icon}</span></div><h1>{lesson.title}</h1><p className="lesson-flow-lede">{lesson.intro}</p><div className="lesson-flow-context"><span>{lesson.context}</span><strong>{phrase}</strong><small>{lesson.duration}</small></div><button className="lesson-flow-primary" type="button" onClick={next}>Begin lesson <span>→</span></button></>;
      case 1: return <><div className="lesson-flow-kicker">WORDS YOU WILL HEAR · {wordPage + 1} / {wordPages}</div><h1>Build a small bank.</h1><p className="lesson-flow-lede">These are the words that make the situation easier. Hear any word again when you need it.</p><div className="lesson-flow-word-list">{visibleWords.map(([word, meaning, note]) => <div className="lesson-flow-word" key={word}><div><strong lang="de">{word}</strong><span>{meaning}</span><small>{note}</small></div><button type="button" aria-label={`Listen to ${word}`} onClick={() => listen(word)}>▶</button></div>)}</div><button className="lesson-flow-primary" type="button" onClick={advanceWords}>{wordPage < wordPages - 1 ? 'More words' : 'I’m ready'} <span>→</span></button></>;
      case 2: return <><div className="lesson-flow-kicker">THE MAIN PATTERN</div><h1>One question, a few useful turns.</h1><p className="lesson-flow-lede">Start with the main sentence, then notice how the same situation changes.</p><div className="lesson-flow-phrase-card"><p lang="de">{phrase}</p><ListenButton onClick={() => listen()} /><div className="lesson-flow-translation">{lesson.translation}</div></div><div className="lesson-flow-variations">{lesson.variations.map((variation) => <button type="button" key={variation} onClick={() => listen(variation)}><span lang="de">{variation}</span><small>▶</small></button>)}</div><p className="lesson-flow-note">{lesson.note}</p><button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button></>;
      case 3: return <><div className="lesson-flow-kicker">HEAR THE MEANING</div><h1>What did you hear?</h1><p className="lesson-flow-lede">Listen to the phrase, then choose what it means in the shop.</p><div className="lesson-flow-listen-stage"><ListenButton label="Play phrase" onClick={() => listen(lesson.heardPhrase || phrase)} /></div><div className="lesson-flow-options">{lesson.meaning.map(([label], index) => <button className={meaningChoice === index ? 'selected' : ''} type="button" key={label} onClick={() => setMeaningChoice(index)}>{label}</button>)}</div>{meaningChoice !== null && <p className={`lesson-flow-feedback ${meaningCorrect ? 'good' : 'try'}`}>{meaningCorrect ? 'Yes — that is what the phrase means.' : 'Not quite. Listen once more and try again.'}</p>}{meaningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 4:
        if (lesson.labels) return <><div className="lesson-flow-kicker">READ THE REAL THING</div><h1>What does this sign tell you?</h1><p className="lesson-flow-lede">Use the words, not every number. Find the one important piece of information.</p><div className="lesson-flow-labels">{lesson.labels.map((label, index) => <button className={labelChoice === index ? 'selected' : ''} type="button" key={label.lines.join('-')} onClick={() => setLabelChoice(index)}><span>{label.lines.map((line) => <b key={line}>{line}</b>)}</span><small>{label.answer}</small></button>)}</div>{labelChoice !== null && <p className={`lesson-flow-feedback ${labelCorrect ? 'good' : 'try'}`}>{labelCorrect ? 'Good — you found the useful signal.' : 'Look again at the German word that matters here.'}</p>}{labelCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
        return <><div className="lesson-flow-kicker">LISTEN FOR THE SHORT VERSION</div><h1>Which sentence did you hear?</h1><p className="lesson-flow-lede">In a real shop, people often leave words out. Listen for the useful shape.</p><div className="lesson-flow-listen-stage"><ListenButton label="Play shop phrase" onClick={() => listen(lesson.heardPhrase || phrase)} /></div><div className="lesson-flow-options listening-options">{lesson.listening.map((option, index) => <button className={listeningChoice === index ? 'selected' : ''} type="button" key={option} onClick={() => setListeningChoice(index)}>{option}</button>)}</div>{listeningChoice !== null && <p className={`lesson-flow-feedback ${listeningCorrect ? 'good' : 'try'}`}>{listeningCorrect ? 'That’s it. You caught the short shop version.' : 'Listen for the key word and try again.'}</p>}{listeningCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 5: return <><div className="lesson-flow-kicker">RESPOND NATURALLY</div><h1>What would you say?</h1><p className="lesson-flow-lede">Choose one answer that fits the situation. Short and polite is enough.</p><div className="lesson-flow-options">{lesson.responses.map((response, index) => <button className={responseChoice === index ? 'selected' : ''} type="button" key={response} onClick={() => setResponseChoice(index)} lang="de">{response}</button>)}</div>{responseChoice !== null && <p className={`lesson-flow-feedback ${responseCorrect ? 'good' : 'try'}`}>{responseCorrect ? 'Yes — that answer works naturally.' : 'Try the answer that matches the cashier’s question.'}</p>}{responseCorrect && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 6:
        if (!lesson.order) return <><div className="lesson-flow-kicker">MAKE IT YOURS</div><h1>Say one useful response.</h1><p className="lesson-flow-lede">Choose one phrase you would actually use at the till, then say it once to yourself.</p><div className="lesson-flow-phrase-card"><p lang="de">{lesson.responses[lesson.responseAnswer]}</p><ListenButton onClick={() => listen(lesson.responses[lesson.responseAnswer])} /><div className="lesson-flow-translation">A short answer is a complete answer.</div></div><button className="lesson-flow-primary" type="button" onClick={next}>I can say it <span>→</span></button></>;
        return <><div className="lesson-flow-kicker">PUT IT TOGETHER</div><h1>Build the useful sentence.</h1><p className="lesson-flow-lede">Choose the next word. This is for speaking, not for memorising grammar rules.</p><div className="lesson-flow-built-sentence" aria-live="polite">{order.length ? order.join(' ') : 'Choose a word below'}</div><div className="lesson-flow-token-grid">{remainingWords.map((word) => <button key={word} type="button" onClick={() => chooseOrderWord(word)}>{word}</button>)}</div>{orderError && <p className="lesson-flow-feedback try">Try the sentence rhythm again.</p>}{orderComplete && <p className="lesson-flow-feedback good">Good. That is a useful sentence.</p>}{orderComplete && <button className="lesson-flow-primary" type="button" onClick={next}>Next <span>→</span></button>}</>;
      case 7: return <><div className="lesson-flow-kicker">SAY IT ONCE</div><h1>Now use it yourself.</h1><p className="lesson-flow-lede">Say the main phrase out loud. Aim for clear and polite, not perfect.</p><div className="lesson-flow-speak-card"><p lang="de">{phrase}</p><button className={`lesson-flow-mic${speakingState === 'listening' ? ' listening' : ''}`} type="button" onClick={startSpeaking}><span aria-hidden="true">{speakingState === 'listening' ? '●' : '◉'}</span>{speakingState === 'listening' ? 'Listening…' : 'Tap, then speak'}</button>{transcript && <small>Heard: “{transcript}”</small>}</div><p className="lesson-flow-note">Speech recognition is only light feedback. You can continue even if your browser does not hear you.</p>{speakingState === 'heard' && <button className="lesson-flow-primary" type="button" onClick={next}>I said it <span>→</span></button>}</>;
      case 8: return <><div className="lesson-flow-kicker">A ZURICH TIP</div><h1>{lesson.tipTitle}</h1><div className="lesson-flow-tip-card"><span className="lesson-flow-icon">↗</span><p>{lesson.tip}</p></div><p className="lesson-flow-note">You do not need to understand every word to handle one small interaction.</p><button className="lesson-flow-primary" type="button" onClick={next}>Finish lesson <span>→</span></button></>;
      case 9: return <><div className="lesson-flow-kicker">LESSON COMPLETE</div><div className="lesson-flow-complete-mark"><span className="lesson-flow-icon">✓</span></div><h1>Take it into the shop.</h1><p className="lesson-flow-lede">You now have a small set of expressions for one real supermarket situation.</p><div className="lesson-flow-task-card"><small>REAL-WORLD TASK</small><strong>{lesson.task}</strong><span lang="de">„{phrase}“</span></div>{!taskDone ? <button className="lesson-flow-primary" type="button" onClick={finishTask}>I’ll try this <span>→</span></button> : <div className="lesson-flow-task-done">Task saved for this week.</div>}<Link className="lesson-flow-back" to="/">Back to Module 1</Link></>;
      default: return null;
    }
  };

  return <div className={`lesson-flow-page theme-${theme}`}><div className="lesson-flow-appbar"><Link to="/" className="lesson-flow-back-arrow" aria-label="Back to Module 1">‹</Link><span>Module 1 · Migros &amp; Coop</span><span className="lesson-flow-appbar-spacer" /><button className="lesson-flow-theme" type="button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '☼' : '☾'}</button></div><main className="lesson-flow"><ProgressHeader step={step} total={totalSteps} /><section className="lesson-flow-card" aria-live="polite">{renderStep()}</section>{step > 0 && step < totalSteps - 1 && <button className="lesson-flow-secondary" type="button" onClick={back}>Back</button>}</main></div>;
}
