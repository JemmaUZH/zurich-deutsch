import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import compression from 'compression';
import 'dotenv/config';
import { db, nowIso, todayStr, recordActivity, computeStreak } from './db.js';
import { LESSONS } from './content.js';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECRET = process.env.JWT_SECRET || 'zurich-deutsch-dev-secret';

// 朗读音频缓存：同一句（同语速同音色）第二次播放直接命中，无需重新合成
const ttsCache = new Map();
const TTS_CACHE_MAX = 300;
function ttsCacheKey(kind, text, rate, voice) {
  return `${kind}|${voice}|${rate}|${text}`;
}
function ttsCacheGet(key) {
  const hit = ttsCache.get(key);
  if (hit) {
    ttsCache.delete(key);
    ttsCache.set(key, hit); // LRU：最近使用放最后
  }
  return hit;
}
function ttsCacheSet(key, buf) {
  if (ttsCache.size >= TTS_CACHE_MAX) {
    const oldest = ttsCache.keys().next().value;
    if (oldest !== undefined) ttsCache.delete(oldest);
  }
  ttsCache.set(key, buf);
}

const app = express();
app.use(compression());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

/* ---------- helpers ---------- */

function seedLessons() {
  const activeLessons = LESSONS.filter((l) => !l.archived);
  const insert = db.prepare(`
    INSERT INTO lessons (slug, title, level, topic, emoji, description, description_en, content_json, vocab_json, quiz_json, word_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      level = excluded.level,
      topic = excluded.topic,
      emoji = excluded.emoji,
      description = excluded.description,
      description_en = excluded.description_en,
      content_json = excluded.content_json,
      vocab_json = excluded.vocab_json,
      quiz_json = excluded.quiz_json,
      word_count = excluded.word_count
  `);
  for (const l of activeLessons) {
    const wordCount = l.content.join(' ').split(/\s+/).filter(Boolean).length;
    insert.run(
      l.slug,
      l.title,
      l.level,
      l.topic,
      l.emoji || '',
      l.description,
      l.descriptionEn || '',
      JSON.stringify(l.content),
      JSON.stringify(l.vocab),
      JSON.stringify(l.quiz),
      wordCount
    );
  }

  // 清理已归档课程（连同相关进度数据）
  const archivedSlugs = new Set(LESSONS.filter((l) => l.archived).map((l) => l.slug));
  const stale = db.prepare(`SELECT id, slug FROM lessons`).all().filter((r) => archivedSlugs.has(r.slug));
  for (const row of stale) {
    db.prepare(`DELETE FROM user_lessons WHERE lesson_id = ?`).run(row.id);
    db.prepare(`DELETE FROM user_vocab WHERE lesson_id = ?`).run(row.id);
    db.prepare(`DELETE FROM quiz_attempts WHERE lesson_id = ?`).run(row.id);
    db.prepare(`DELETE FROM lessons WHERE id = ?`).run(row.id);
  }

  console.log(`Synced ${activeLessons.length} lessons${stale.length ? `, removed ${stale.length} archived` : ''}.`);
}

function signToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, {
    expiresIn: '30d',
  });
}

function identify(req) {
  const deviceId = req.headers['x-device-id'];
  if (deviceId && typeof deviceId === 'string' && deviceId.length < 200) {
    let row = db.prepare(`SELECT * FROM users WHERE device_id = ?`).get(deviceId);
    if (!row) {
      const info = db
        .prepare(`INSERT INTO users (name, email, password_hash, device_id) VALUES (?, ?, '', ?)`)
        .run('Gast', `device-${deviceId}@local`, deviceId);
      row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(info.lastInsertRowid);
    }
    return { id: row.id, name: row.name, email: row.email };
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function auth(req, res, next) {
  const user = identify(req);
  if (!user) return res.status(401).json({ error: '请先登录' });
  req.user = user;
  next();
}

function publicLesson(row, userId) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    level: row.level,
    topic: row.topic,
    emoji: row.emoji,
    description: row.description,
    descriptionEn: row.description_en,
    wordCount: row.word_count,
  };
}

function sm2Update(row, grade) {
  let ease = row.ease;
  let interval = row.interval_days || 0;
  let lapses = row.lapses;
  let reviews = row.reviews + 1;

  if (grade === 0) {
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
    lapses += 1;
  } else if (grade === 1) {
    interval = Math.max(1, Math.round(interval * 1.2) || 1);
    ease = Math.max(1.3, ease - 0.15);
  } else if (grade === 2) {
    interval = interval <= 0 ? 1 : Math.round(interval * ease);
  } else {
    interval = interval <= 0 ? 2 : Math.round(interval * ease * 1.3);
    ease = Math.min(3.0, ease + 0.15);
  }

  const dueAt = new Date(Date.now() + interval * 86400000).toISOString();
  return { ease, interval, lapses, reviews, dueAt };
}

/* ---------- auth ---------- */

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: '姓名、邮箱和密码都不能为空' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要 6 位' });
  }
  const exists = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
  if (exists) return res.status(409).json({ error: '该邮箱已注册，请直接登录' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`)
    .run(name, email, hash);
  const user = { id: info.lastInsertRowid, name, email };
  res.json({ token: signToken(user), user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email || '');
  if (!row || !bcrypt.compareSync(password || '', row.password_hash)) {
    return res.status(401).json({ error: '邮箱或密码不正确' });
  }
  const user = { id: row.id, name: row.name, email: row.email };
  res.json({ token: signToken(user), user });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

/* ---------- lessons ---------- */

app.get('/api/lessons', auth, (req, res) => {
  const { level } = req.query;
  const rows = level
    ? db.prepare(`SELECT * FROM lessons WHERE level = ? ORDER BY id`).all(String(level).toUpperCase())
    : db.prepare(`SELECT * FROM lessons ORDER BY id`).all();

  const progressStmt = db.prepare(
    `SELECT lesson_id, completed_at, best_score, attempts FROM user_lessons WHERE user_id = ?`
  );
  const progress = new Map(
    progressStmt.all(req.user.id).map((p) => [p.lesson_id, p])
  );

  res.json({
    lessons: rows.map((row) => ({
      ...publicLesson(row, req.user.id),
      progress: progress.get(row.id) || null,
    })),
  });
});

app.get('/api/lessons/:id', auth, (req, res) => {
  const row = db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: '课程不存在' });

  const progress =
    db
      .prepare(`SELECT completed_at, best_score, attempts FROM user_lessons WHERE user_id = ? AND lesson_id = ?`)
      .get(req.user.id, row.id) || null;

  const savedRows = db
    .prepare(`SELECT lemma FROM user_vocab WHERE user_id = ?`)
    .all(req.user.id)
    .map((r) => r.lemma.toLowerCase());

  res.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    level: row.level,
    topic: row.topic,
    emoji: row.emoji,
    description: row.description,
    descriptionEn: row.description_en,
    wordCount: row.word_count,
    content: JSON.parse(row.content_json),
    vocab: JSON.parse(row.vocab_json),
    quiz: JSON.parse(row.quiz_json),
    progress,
    savedLemmas: savedRows,
  });
});

app.post('/api/lessons/:id/complete', auth, (req, res) => {
  const row = db.prepare(`SELECT id FROM lessons WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: '课程不存在' });

  db.prepare(`
    INSERT INTO user_lessons (user_id, lesson_id, completed_at, best_score, attempts)
    VALUES (?, ?, ?, 0, 0)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed_at = COALESCE(completed_at, excluded.completed_at)
  `).run(req.user.id, row.id, nowIso());
  recordActivity(req.user.id);
  res.json({ ok: true });
});

app.post('/api/lessons/:id/quiz-result', auth, (req, res) => {
  const row = db.prepare(`SELECT id FROM lessons WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: '课程不存在' });

  const score = Number(req.body?.score) || 0;
  const total = Number(req.body?.total) || 0;
  if (!total) return res.status(400).json({ error: '缺少测验数据' });

  db.prepare(`INSERT INTO quiz_attempts (user_id, lesson_id, score, total) VALUES (?, ?, ?, ?)`).run(
    req.user.id,
    row.id,
    score,
    total
  );

  const pct = Math.round((score / total) * 100);
  db.prepare(`
    INSERT INTO user_lessons (user_id, lesson_id, completed_at, best_score, attempts)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      attempts = attempts + 1,
      best_score = MAX(COALESCE(best_score, 0), excluded.best_score)
  `).run(req.user.id, row.id, nowIso(), pct);

  recordActivity(req.user.id);
  res.json({ ok: true, bestScore: pct });
});

/* ---------- vocabulary & spaced repetition ---------- */

app.get('/api/vocab', auth, (req, res) => {
  const rows = db
    .prepare(`
      SELECT v.*, l.title AS lesson_title, l.emoji AS lesson_emoji
      FROM user_vocab v
      JOIN lessons l ON l.id = v.lesson_id
      WHERE v.user_id = ?
      ORDER BY v.due_at ASC, v.created_at DESC
    `)
    .all(req.user.id);
  const now = Date.now();
  res.json({
    items: rows.map((r) => ({ ...r, due: new Date(r.due_at).getTime() <= now })),
  });
});

app.post('/api/vocab', auth, (req, res) => {
  const { lessonId, lemma, word, lang } = req.body || {};
  if (!lessonId || !lemma) return res.status(400).json({ error: '缺少生词信息' });

  const lesson = db.prepare(`SELECT * FROM lessons WHERE id = ?`).get(lessonId);
  if (!lesson) return res.status(404).json({ error: '课程不存在' });

  const vocabList = JSON.parse(lesson.vocab_json);
  const entry = vocabList.find(
    (v) => v.lemma.toLowerCase() === String(lemma).toLowerCase()
  );

  const existing = db
    .prepare(`SELECT * FROM user_vocab WHERE user_id = ? AND lemma = ?`)
    .get(req.user.id, lemma);
  if (existing) {
    recordActivity(req.user.id);
    return res.json({ item: existing, alreadySaved: true });
  }

  const en = lang === 'en';
  const data = entry
    ? {
        lemma: entry.lemma,
        word: entry.word,
        translation: en ? entry.translationEn || entry.translation : entry.translation,
        explanation: en ? entry.explanationEn || entry.explanation : entry.explanation,
        partOfSpeech: entry.partOfSpeech,
      }
    : {
        lemma,
        word: word || lemma,
        translation: '',
        explanation: en
          ? 'This word is not in the lesson vocabulary yet.'
          : '这个单词暂未收录到课文词典中。',
        partOfSpeech: '',
      };

  const info = db
    .prepare(`
      INSERT INTO user_vocab (user_id, lesson_id, word, lemma, translation, explanation, part_of_speech, due_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      req.user.id,
      lessonId,
      data.word,
      data.lemma,
      data.translation,
      data.explanation || '',
      data.partOfSpeech || '',
      nowIso()
    );
  recordActivity(req.user.id);
  res.json({
    item: db.prepare(`SELECT * FROM user_vocab WHERE id = ?`).get(info.lastInsertRowid),
    alreadySaved: false,
  });
});

app.delete('/api/vocab/:id', auth, (req, res) => {
  const row = db
    .prepare(`SELECT id FROM user_vocab WHERE id = ? AND user_id = ?`)
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: '生词不存在' });
  db.prepare(`DELETE FROM user_vocab WHERE id = ?`).run(row.id);
  res.json({ ok: true });
});

app.post('/api/vocab/:id/review', auth, (req, res) => {
  const row = db
    .prepare(`SELECT * FROM user_vocab WHERE id = ? AND user_id = ?`)
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: '生词不存在' });

  const grade = Math.max(0, Math.min(3, Number(req.body?.grade) ?? 2));
  const next = sm2Update(row, grade);
  db.prepare(`
    UPDATE user_vocab
    SET ease = ?, interval_days = ?, reviews = ?, lapses = ?, due_at = ?
    WHERE id = ?
  `).run(next.ease, next.interval, next.reviews, next.lapses, next.dueAt, row.id);
  recordActivity(req.user.id);
  res.json({
    item: db.prepare(`SELECT * FROM user_vocab WHERE id = ?`).get(row.id),
    nextDueDays: next.interval,
  });
});

/* ---------- stats ---------- */

app.get('/api/stats', auth, (req, res) => {
  const lessonsCompleted =
    db
      .prepare(`SELECT COUNT(*) AS n FROM user_lessons WHERE user_id = ? AND completed_at IS NOT NULL`)
      .get(req.user.id).n;
  const wordsLearned = db.prepare(`SELECT COUNT(*) AS n FROM user_vocab WHERE user_id = ?`).get(req.user.id).n;
  const dueCount = db
    .prepare(`SELECT COUNT(*) AS n FROM user_vocab WHERE user_id = ? AND due_at <= ?`)
    .get(req.user.id, nowIso()).n;
  const reviewsTotal = db
    .prepare(`SELECT COALESCE(SUM(reviews), 0) AS n FROM user_vocab WHERE user_id = ?`)
    .get(req.user.id).n;
  const quizRow = db
    .prepare(`SELECT COALESCE(SUM(score), 0) AS s, COALESCE(SUM(total), 0) AS t FROM quiz_attempts WHERE user_id = ?`)
    .get(req.user.id);
  const recent = db
    .prepare(`
      SELECT q.score, q.total, q.taken_at, l.title, l.emoji, l.id AS lesson_id
      FROM quiz_attempts q
      JOIN lessons l ON l.id = q.lesson_id
      WHERE q.user_id = ?
      ORDER BY q.taken_at DESC
      LIMIT 10
    `)
    .all(req.user.id);
  const activityDays = db
    .prepare(`SELECT COUNT(*) AS n FROM daily_activity WHERE user_id = ?`)
    .get(req.user.id).n;

  res.json({
    streak: computeStreak(req.user.id),
    lessonsCompleted,
    wordsLearned,
    dueCount,
    reviewsTotal,
    avgScore: quizRow.t ? Math.round((quizRow.s / quizRow.t) * 100) : null,
    activityDays,
    recent,
  });
});

/* ---------- text-to-speech ---------- */

app.get('/api/tts/status', (req, res) => {
  res.json({
    edge: true,
    openai: Boolean(process.env.OPENAI_API_KEY),
  });
});

// 免费高质量语音：Microsoft Edge 神经网络德语声音（无需 key）
app.post('/api/tts/edge', async (req, res) => {
  const { text, rate = 1 } = req.body || {};
  if (!text) return res.status(400).json({ error: '缺少朗读文本' });
  const key = ttsCacheKey('edge', text, rate, 'de-DE-KatjaNeural');
  const cached = ttsCacheGet(key);
  if (cached) {
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    return res.send(cached);
  }
  const safeText = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(
      'de-DE-KatjaNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    );
    const { audioStream } = tts.toStream(safeText, {
      rate: Math.min(2, Math.max(0.5, Number(rate) || 1)),
    });
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', (c) => chunks.push(c));
      audioStream.on('end', resolve);
      audioStream.on('close', resolve);
      audioStream.on('error', reject);
    });
    const audio = Buffer.concat(chunks);
    if (!audio.length) return res.status(502).json({ error: 'Edge 语音返回为空' });
    ttsCacheSet(key, audio);
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(audio);
  } catch {
    res.status(502).json({ error: 'Edge 免费语音暂时不可用' });
  } finally {
    tts.close();
  }
});

// 可选高质量语音：OpenAI TTS（需要 OPENAI_API_KEY）
app.post('/api/tts/openai', async (req, res) => {
  const { text, rate = 1 } = req.body || {};
  if (!text) return res.status(400).json({ error: '缺少朗读文本' });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(501).json({ error: '未配置 OPENAI_API_KEY' });
  }
  const key = ttsCacheKey('openai', text, rate, 'nova');
  const cached = ttsCacheGet(key);
  if (cached) {
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    return res.send(cached);
  }
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'nova',
        input: text,
        speed: Math.min(2, Math.max(0.5, Number(rate) || 1)),
        instructions: 'Sprich natürlich, deutlich und freundlich auf Hochdeutsch.',
      }),
    });
    if (!r.ok) {
      return res.status(502).json({ error: `TTS 服务返回错误（${r.status}）` });
    }
    const audio = Buffer.from(await r.arrayBuffer());
    ttsCacheSet(key, audio);
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(audio);
  } catch {
    res.status(502).json({ error: 'TTS 请求失败，请检查网络与 API Key' });
  }
});

/* ---------- production static serving ---------- */

const distDir = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(distDir)) {
  app.use(
    express.static(distDir, {
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器内部错误' });
});

seedLessons();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ZüriLese API running on http://localhost:${PORT}`);
});
