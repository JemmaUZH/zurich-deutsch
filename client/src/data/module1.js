export const MODULE1_LESSONS = [
  {
    id: 'finding-products',
    title: 'Finding products',
    phrase: 'Wo finde ich die Hafermilch?',
    description: 'Ask where something is and understand simple directions.',
    icon: 'bag',
    route: '/module-1/finding-products',
  },
  {
    id: 'aktion-price-tags',
    title: 'Aktion & price tags',
    phrase: 'Was bedeutet Aktion?',
    description: 'Understand discounts, reduced prices and unit pricing.',
    icon: 'tag',
    route: '/module-1/aktion-price-tags',
  },
  {
    id: 'checkout',
    title: 'Checkout',
    phrase: 'Bar oder Karte?',
    description: 'Understand the cashier and respond naturally.',
    icon: 'card',
    route: '/module-1/checkout',
  },
  {
    id: 'cumulus-supercard',
    title: 'Cumulus & Supercard',
    phrase: 'Haben Sie Cumulus?',
    description: 'Recognize loyalty-card questions.',
    icon: 'loyalty',
    route: '/module-1/cumulus-supercard',
  },
  {
    id: 'fruit-bags-receipts',
    title: 'Fruit, bags & receipts',
    phrase: 'Brauchen Sie eine Tasche?',
    description: 'Understand produce scales, bags, receipts and common supermarket signs.',
    icon: 'receipt',
    route: '/module-1/fruit-bags-receipts',
  },
];

export const MODULE1_MISSION = {
  id: 'migros-real-life-mission',
  title: 'Real-life mission',
  description: 'Do one supermarket trip partly in German.',
  icon: 'summit',
  route: '/module-1/mission',
};

export const MODULE1_PROGRESS_KEY = 'zurich-migros-progress';

export function defaultModule1Progress() {
  return {
    completedLessons: [],
    currentLesson: MODULE1_LESSONS[0].id,
    missionTried: false,
  };
}

export function readModule1Progress() {
  const fallback = defaultModule1Progress();
  try {
    const stored = JSON.parse(localStorage.getItem(MODULE1_PROGRESS_KEY) || 'null');
    if (!stored || !Array.isArray(stored.completedLessons)) return fallback;
    return {
      ...fallback,
      ...stored,
      completedLessons: stored.completedLessons.filter((id) => MODULE1_LESSONS.some((lesson) => lesson.id === id)),
    };
  } catch {
    return fallback;
  }
}

export function saveModule1Progress(progress) {
  localStorage.setItem(MODULE1_PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new CustomEvent('module1-progress-change'));
}

export function startModule1Lesson(id) {
  const progress = readModule1Progress();
  saveModule1Progress({ ...progress, currentLesson: id });
}

export function startModule1Mission() {
  const progress = readModule1Progress();
  saveModule1Progress({ ...progress, currentLesson: MODULE1_MISSION.id });
}

export function completeModule1Lesson(id) {
  const progress = readModule1Progress();
  const completedLessons = Array.from(new Set([...progress.completedLessons, id]));
  const next = MODULE1_LESSONS.find((lesson) => !completedLessons.includes(lesson.id));
  const nextProgress = {
    ...progress,
    completedLessons,
    currentLesson: next?.id,
  };
  saveModule1Progress(nextProgress);
  return nextProgress;
}

export function completeModule1Mission() {
  const progress = readModule1Progress();
  const nextProgress = { ...progress, missionTried: true };
  saveModule1Progress(nextProgress);
  return nextProgress;
}
