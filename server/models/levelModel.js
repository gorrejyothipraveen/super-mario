import db from './db.js'

function toLevel(row) {
  if (!row) return null
  return {
    id:         row.id,
    name:       row.name,
    background: row.background,
    config:     JSON.parse(row.config_json),
    published:  Boolean(row.published),
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  }
}

export function getAllLevels(includeUnpublished = false) {
  const sql = includeUnpublished
    ? 'SELECT * FROM levels ORDER BY id ASC'
    : 'SELECT * FROM levels WHERE published = 1 ORDER BY id ASC'
  return db.prepare(sql).all().map(toLevel)
}

export function getLevelById(id) {
  return toLevel(db.prepare('SELECT * FROM levels WHERE id = ?').get(id))
}

export function createLevel({ name, background, config_json }) {
  const { lastInsertRowid } = db.prepare(
    `INSERT INTO levels (name, background, config_json) VALUES (?, ?, ?)`
  ).run(name, background, config_json)
  return getLevelById(lastInsertRowid)
}

export function updateLevel(id, fields) {
  const cols = []
  const params = []
  if (fields.name        !== undefined) { cols.push('name = ?');        params.push(fields.name) }
  if (fields.background  !== undefined) { cols.push('background = ?');  params.push(fields.background) }
  if (fields.config_json !== undefined) { cols.push('config_json = ?'); params.push(fields.config_json) }
  if (cols.length === 0) return getLevelById(id)
  cols.push("updated_at = datetime('now')")
  params.push(id)
  db.prepare(`UPDATE levels SET ${cols.join(', ')} WHERE id = ?`).run(...params)
  return getLevelById(id)
}

export function setPublished(id, published) {
  db.prepare(
    `UPDATE levels SET published = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(published ? 1 : 0, id)
  return getLevelById(id)
}

export function deleteLevel(id) {
  return db.prepare('DELETE FROM levels WHERE id = ?').run(id).changes > 0
}
