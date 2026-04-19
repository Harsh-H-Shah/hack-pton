import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/tmp/ecoverse.db'
  : path.join(process.cwd(), 'ecoverse.db');

let _db;
function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    migrate(_db);
  }
  return _db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL DEFAULT 'Eco Warrior',
      environment      TEXT NOT NULL DEFAULT 'home',
      total_xp         INTEGER NOT NULL DEFAULT 0,
      total_co2_saved  REAL NOT NULL DEFAULT 0,
      streak_days      INTEGER NOT NULL DEFAULT 0,
      last_action_date TEXT,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS actions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      action_id   TEXT NOT NULL,
      category    TEXT NOT NULL,
      xp_earned   INTEGER NOT NULL,
      co2_saved   REAL NOT NULL,
      description TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS category_counts (
      user_id  TEXT NOT NULL,
      category TEXT NOT NULL,
      count    INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, category),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export function getOrCreateUser(id = 'default-user') {
  const db = getDb();
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    db.prepare(
      'INSERT INTO users (id) VALUES (?)'
    ).run(id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  return user;
}

export function setEnvironment(userId, environment) {
  getDb().prepare('UPDATE users SET environment = ? WHERE id = ?').run(environment, userId);
}

export function logAction(userId, actionId, category, xp, co2, description = null) {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const user = getOrCreateUser(userId);

  // Streak logic
  let newStreak = user.streak_days;
  if (user.last_action_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    newStreak = user.last_action_date === yesterday ? user.streak_days + 1 : 1;
  }

  db.prepare(`
    INSERT INTO actions (id, user_id, action_id, category, xp_earned, co2_saved, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, actionId, category, xp, co2, description);

  db.prepare(`
    UPDATE users
    SET total_xp = total_xp + ?,
        total_co2_saved = total_co2_saved + ?,
        streak_days = ?,
        last_action_date = ?
    WHERE id = ?
  `).run(xp, co2, newStreak, today, userId);

  db.prepare(`
    INSERT INTO category_counts (user_id, category, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, category) DO UPDATE SET count = count + 1
  `).run(userId, category);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function getActions(userId, limit = 20) {
  return getDb()
    .prepare('SELECT * FROM actions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(userId, limit);
}

export function getUserStats(userId) {
  const db = getDb();
  const user = getOrCreateUser(userId);
  const counts = db.prepare('SELECT category, count FROM category_counts WHERE user_id = ?').all(userId);
  const categoryCounts = Object.fromEntries(counts.map(r => [r.category, r.count]));

  const today = new Date().toISOString().slice(0, 10);
  const actionsToday = db
    .prepare("SELECT COUNT(*) as n FROM actions WHERE user_id = ? AND date(created_at) = ?")
    .get(userId, today).n;

  const categoryBreakdown = db
    .prepare(`SELECT category, SUM(co2_saved) as co2, SUM(xp_earned) as xp, COUNT(*) as count
              FROM actions WHERE user_id = ? GROUP BY category`)
    .all(userId);

  return { user, categoryCounts, actionsToday, categoryBreakdown };
}

export function resyncUser(userId, xp, co2) {
  const db = getDb();
  const user = getOrCreateUser(userId);
  if (xp > user.total_xp) {
    db.prepare('UPDATE users SET total_xp = ?, total_co2_saved = ? WHERE id = ?')
      .run(xp, Math.max(co2, user.total_co2_saved), userId);
  }
}

export function getCategoryCounts(userId) {
  const rows = getDb()
    .prepare('SELECT category, count FROM category_counts WHERE user_id = ?')
    .all(userId);
  return Object.fromEntries(rows.map(r => [r.category, r.count]));
}
