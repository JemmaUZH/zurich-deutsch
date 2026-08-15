import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'zurich.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    topic TEXT NOT NULL,
    emoji TEXT,
    description TEXT NOT NULL,
    description_en TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'de',
    content_json TEXT NOT NULL,
    vocab_json TEXT NOT NULL,
    quiz_json TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_lessons (
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    completed_at TEXT,
    best_score REAL,
    attempts INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS user_vocab (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    word TEXT NOT NULL,
    lemma TEXT NOT NULL,
    translation TEXT NOT NULL,
    explanation TEXT,
    part_of_speech TEXT,
    ease REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    due_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, lemma)
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    taken_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS daily_activity (
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
  );
`);

// 轻量迁移：老数据库补列
const userCols = db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name);
if (!userCols.includes('device_id')) {
  db.exec(`ALTER TABLE users ADD COLUMN device_id TEXT`);
}
db.exec(
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id) WHERE device_id IS NOT NULL`
);
const lessonCols = db.prepare(`PRAGMA table_info(lessons)`).all().map((c) => c.name);
if (!lessonCols.includes('description_en')) {
  db.exec(`ALTER TABLE lessons ADD COLUMN description_en TEXT NOT NULL DEFAULT ''`);
}
if (!lessonCols.includes('language')) {
  db.exec(`ALTER TABLE lessons ADD COLUMN language TEXT NOT NULL DEFAULT 'de'`);
}

export const nowIso = () => new Date().toISOString();
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function recordActivity(userId) {
  db.prepare(
    `INSERT OR IGNORE INTO daily_activity (user_id, date) VALUES (?, ?)`
  ).run(userId, todayStr());
}

export function computeStreak(userId) {
  const rows = db
    .prepare(`SELECT date FROM daily_activity WHERE user_id = ?`)
    .all(userId)
    .map((r) => r.date);
  const set = new Set(rows);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const shift = (d, days) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };
  let streak = 0;
  let cursor = new Date();
  if (!set.has(fmt(cursor))) cursor = shift(cursor, -1);
  while (set.has(fmt(cursor))) {
    streak += 1;
    cursor = shift(cursor, -1);
  }
  return streak;
}
