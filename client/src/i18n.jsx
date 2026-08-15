import { createContext, useContext, useEffect } from 'react';

// English-only interface

const en = {
  docTitle: 'ZüriLese · Learn German by Reading',
  loading: 'Loading…',

  learn: 'Learn',
  vocab: 'Vocabulary',
  grammar: 'Grammar',
  deviceMode: 'Local mode',

  heroGreeting: 'Hello! 🇨🇭',
  heroDesc:
    'Learn German through real stories about everyday life in Zurich: read, tap, answer — and it slowly sticks.',
  statStreak: 'Day streak',
  statLessons: 'Lessons read',
  statWords: 'Words saved',
  statDue: 'Words due',
  lessonTitle: 'Reading lessons',
  all: 'All',
  moduleDe: 'Deutsch',
  moduleEn: 'English',
  wordCount: '{n} words',
  completed: 'Completed',
  bestScore: 'Best {n} pts',
  recentQuiz: 'Recent quizzes',
  emptyLevel: 'No lessons at this level yet — coming soon!',
  topics: {
    Alltag: 'Everyday life',
    Einkaufen: 'Shopping',
    Freizeit: 'Leisure',
    Studentenleben: 'Student life',
    Schulsport: 'School sports',
    Kochen: 'Cooking',
    Musik: 'Music',
    Freundschaft: 'Friendship',
    Tiere: 'Animals',
    Hobby: 'Hobby',
    Studium: 'Studies',
    Wohnen: 'Housing',
    Gesundheit: 'Health',
    Nachbarschaft: 'Neighbourhood',
  },

  back: '← Back to library',
  readAll: '▶ Read aloud',
  stop: '■ Stop',
  speed: 'Speed',
  readerHint: 'Tap a word for its meaning · tap a sentence to start reading from there',
  sentencePlayHint: 'Start reading from this sentence',
  markComplete: "✓ I've finished this story",
  finishedBadge: 'Finished',
  quizSection: 'Quiz',
  vocabSection: 'Key vocabulary',
  nextQuestion: 'Next',
  seeResult: 'See result',
  correct: 'Correct!',
  correctAnswer: 'Correct answer: {letter}',
  tryAgain: 'Try again',
  resultGreat: 'Excellent — keep it up! 🎉',
  resultGood: 'Nice — keep practicing! 💪',
  resultKeep: "Don't worry — reread and try again! 📖",
  bestScoreLabel: 'Best score: {n}',
  questionNum: 'Question {n} of {total}',
  quizTypes: {
    article: 'Articles',
    vocab: 'Vocabulary',
    grammar: 'Grammar',
    comprehension: 'Comprehension',
  },
  popoverNotInVocab: '(Not in this lesson — you can still save it)',
  popoverNotSaved:
    "This word isn't in the lesson's vocabulary, but you can save it and add a note later.",
  listen: '🔊 Listen',
  saveWord: 'Save word',
  savedWord: 'Saved ✓',
  savedToast: 'Added to vocabulary 📌',
  completeToast: 'Progress saved ✅',
  saveFailed: 'Could not save your score — please try again',
  engineAuto: '🔊 Auto (free first)',
  engineEdge: 'Free HD (Edge)',
  engineOpenai: 'OpenAI HD',
  engineOpenaiOff: 'OpenAI HD (not configured)',
  engineBrowser: 'System voice',

  vocabTitle: 'Flashcards',
  dueTab: 'Due {n}',
  allTab: 'All {n}',
  emptyNoWords: 'No saved words yet. Tap any word while reading to save it!',
  emptyDone: 'All words reviewed for today — take a break!',
  goRead: 'Pick a story →',
  flashHintFront: 'Tap the card to see the meaning',
  flashHintBack: 'Recalled it? Rate yourself ↓',
  fromLesson: 'From: {title}',
  cardProgress: 'Card {n} of {total} · {done} done',
  roundDone: 'All cards in this round reviewed!',
  reviewAgain: 'Review again',
  grades: {
    again: 'Again',
    hard: 'Hard',
    good: 'Good',
    easy: 'Easy',
  },
  gradeIntervals: {
    again: '1 day',
    hard: '1–2 days',
    good: 'a few days',
    easy: 'longer',
  },
  nextReview: '"{word}" next review: {interval}',
  listTitle: 'Word list',
  noTranslation: '(no meaning yet)',
  scheduled: 'Scheduled',
  dueToday: 'Due today',
  dueYesterday: 'Due yesterday',
  dueAgo: 'Due {n} days ago',
  removeWord: 'Remove word',
  removedToast: 'Removed',
  noWordsYet: 'No words yet',

  hardBadge: 'Hard',

  grammarTitle: 'Grammar reference',
};

const serverErrorMap = {
  '请先登录': 'Please sign in',
  '登录已过期，请重新登录': 'Session expired — please sign in again',
  '姓名、邮箱和密码都不能为空': 'Name, email and password are required',
  '邮箱格式不正确': 'Invalid email format',
  '密码至少需要 6 位': 'Password must be at least 6 characters',
  '该邮箱已注册，请直接登录': 'This email is already registered — please log in',
  '邮箱或密码不正确': 'Incorrect email or password',
  '课程不存在': 'Lesson not found',
  '生词不存在': 'Word not found',
  '缺少测验数据': 'Missing quiz data',
  '缺少生词信息': 'Missing word info',
  '缺少朗读文本': 'Missing text to read',
  'Edge 免费语音暂时不可用': 'Edge voice is temporarily unavailable',
  '服务器内部错误': 'Server error',
  '请求失败，请稍后再试': 'Request failed, please try again',
};

export function translateServerError(message) {
  return serverErrorMap[message] || message;
}

const LangContext = createContext(null);

export function I18nProvider({ children }) {
  useEffect(() => {
    document.title = en.docTitle;
    document.documentElement.lang = 'en';
  }, []);

  const t = (key, vars) => {
    let s = en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    }
    return s;
  };

  return <LangContext.Provider value={{ lang: 'en', t }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}

export function topicLabel(topic) {
  return en.topics[topic] || topic;
}

export function quizTypeLabel(type) {
  return en.quizTypes[type] || type;
}
