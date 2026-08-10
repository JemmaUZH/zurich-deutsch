// 把句子拆成带标签的词/标点 token，保留原文顺序和空格信息
export function tokenize(text) {
  const tokens = [];
  const re = /([\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*)|([^\p{L}\p{M}\p{N}\s])/gu;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last && tokens.length) {
      tokens[tokens.length - 1].spaceAfter = /\s/.test(text.slice(last, m.index));
    }
    if (m[1]) tokens.push({ type: 'word', value: m[1], spaceAfter: false });
    else if (m[2]) tokens.push({ type: 'punct', value: m[2], spaceAfter: false });
    last = m.index + m[0].length;
  }
  return tokens;
}

export function normalizeWord(w) {
  return w
    .toLowerCase()
    .replace(/[«»„“”"',.!?;:()\-–—]/g, '')
    .trim();
}

// 构建 <word → vocab entry> 查找表，支持多词短语（如 steigt ein）
export function buildVocabMap(vocab) {
  const wordMap = new Map();
  const phraseMap = new Map();
  for (const entry of vocab) {
    const keys = [entry.lemma, ...(entry.forms || [])];
    for (const key of keys) {
      const normalized = normalizeWord(key);
      if (!normalized) continue;
      if (normalized.includes(' ')) phraseMap.set(normalized, entry);
      else wordMap.set(normalized, entry);
    }
  }
  return { wordMap, phraseMap };
}

// 轻量回退：去掉常见词尾后尝试匹配，应对未收录的屈折形式
export function lookupToken(token, { wordMap, phraseMap }) {
  const exact = wordMap.get(token);
  if (exact) return exact;
  const suffixes = ['en', 'er', 'es', 'em', 'e', 'n', 's', 'st', 't'];
  for (const suffix of suffixes) {
    if (token.length > 4 && token.endsWith(suffix)) {
      const hit = wordMap.get(token.slice(0, -suffix.length));
      if (hit) return hit;
    }
  }
  return null;
}

export function countDaysAgo(iso) {
  const then = new Date(iso);
  const now = new Date();
  return Math.floor((now - then) / 86400000);
}

export function formatDue(dueAt, lang = 'zh') {
  const days = countDaysAgo(dueAt);
  if (lang === 'en') {
    if (days <= 0) return 'Due today';
    if (days === 1) return 'Due yesterday';
    return `Due ${days} days ago`;
  }
  if (days <= 0) return '今天到期';
  if (days === 1) return '昨天到期';
  return `${days} 天前到期`;
}
