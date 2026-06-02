import db from './db.js'

export function saveScore(username, score) {
  const stmt = db.prepare('INSERT INTO scores (username, score) VALUES (?, ?)')
  const result = stmt.run(username, score)
  return getScoreById(result.lastInsertRowid)
}

export function getScoreById(id) {
  return db.prepare('SELECT * FROM scores WHERE id = ?').get(id)
}

export function getLeaderboard(limit = 10) {
  return db
    .prepare('SELECT * FROM scores ORDER BY score DESC LIMIT ?')
    .all(limit)
}

export function getHighScore(username) {
  return db
    .prepare('SELECT * FROM scores WHERE username = ? ORDER BY score DESC LIMIT 1')
    .get(username)
}

export function getBestPerPlayer(limit = 10) {
  return db
    .prepare(`
      SELECT username, MAX(score) AS score, COUNT(*) AS plays
      FROM scores
      GROUP BY username
      ORDER BY score DESC
      LIMIT ?
    `)
    .all(limit)
}
