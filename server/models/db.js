import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : process.env.DB_PATH || path.join(__dirname, '../../data/game.db')

const db = new Database(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    username  TEXT    NOT NULL,
    score     INTEGER NOT NULL,
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saves (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE,
    level_index     INTEGER NOT NULL DEFAULT 0,
    score           INTEGER NOT NULL DEFAULT 0,
    unlocked_levels TEXT    NOT NULL DEFAULT '[0]',
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

export default db
