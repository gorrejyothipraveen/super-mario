import db from './db.js'

export function upsertSave(username, levelIndex, score, unlockedLevels) {
  const levels = JSON.stringify(unlockedLevels)
  db.prepare(`
    INSERT INTO saves (username, level_index, score, unlocked_levels, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(username) DO UPDATE SET
      level_index     = excluded.level_index,
      score           = excluded.score,
      unlocked_levels = excluded.unlocked_levels,
      updated_at      = excluded.updated_at
  `).run(username, levelIndex, score, levels)
  return getSave(username)
}

export function getSave(username) {
  const row = db.prepare('SELECT * FROM saves WHERE username = ?').get(username)
  if (!row) return null
  return {
    username:       row.username,
    levelIndex:     row.level_index,
    score:          row.score,
    unlockedLevels: JSON.parse(row.unlocked_levels),
    updatedAt:      row.updated_at,
  }
}
