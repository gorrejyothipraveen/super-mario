import {
  getAllLevels, getLevelById, createLevel, updateLevel, setPublished, deleteLevel,
} from '../models/levelModel.js'

const REQUIRED_CONFIG_KEYS = ['platforms', 'coins', 'enemies', 'goal', 'spawn']

const DEFAULT_CONFIG = {
  spawn:     { xFrac: 0.10 },
  platforms: [{ xFrac: 0.30, fromBottom: 130, w: 140 }],
  coins:     [{ xFrac: 0.30, fromBottom: 165 }],
  enemies:   [{ xFrac: 0.50, fromBottom: 64, leftFrac: 0.40, rightFrac: 0.60 }],
  goal:      { xFrac: 0.95, fromBottom: 70 },
  nextLevel: null,
}

function validateConfigJson(raw) {
  let parsed
  try { parsed = JSON.parse(raw) } catch {
    return 'config_json must be valid JSON'
  }
  const missing = REQUIRED_CONFIG_KEYS.filter(k => !(k in parsed))
  if (missing.length) return `config_json missing required keys: ${missing.join(', ')}`
  return null
}

export function listLevels(req, res, next) {
  try {
    const isAdmin = req.headers['x-admin-key'] === (process.env.ADMIN_KEY || 'dev-admin-key')
    res.json(getAllLevels(isAdmin))
  } catch (err) { next(err) }
}

export function getLevel(req, res, next) {
  try {
    const level = getLevelById(req.params.id)
    if (!level) return res.status(404).json({ message: 'Level not found' })
    res.json(level)
  } catch (err) { next(err) }
}

export function createLevelHandler(req, res, next) {
  try {
    const { name, background, config_json } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: 'name is required' })
    if (name.trim().length > 50) return res.status(400).json({ message: 'name max 50 chars' })
    const rawConfig = config_json ?? JSON.stringify(DEFAULT_CONFIG)
    const err = validateConfigJson(rawConfig)
    if (err) return res.status(400).json({ message: err })
    const level = createLevel({
      name: name.trim(),
      background: background || '#5c94fc',
      config_json: rawConfig,
    })
    res.status(201).json(level)
  } catch (err) { next(err) }
}

export function updateLevelHandler(req, res, next) {
  try {
    if (!getLevelById(req.params.id)) return res.status(404).json({ message: 'Level not found' })
    const { name, background, config_json } = req.body
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'name cannot be empty' })
      if (name.trim().length > 50) return res.status(400).json({ message: 'name max 50 chars' })
    }
    if (config_json !== undefined) {
      const err = validateConfigJson(config_json)
      if (err) return res.status(400).json({ message: err })
    }
    const updated = updateLevel(req.params.id, {
      name:       name !== undefined ? name.trim() : undefined,
      background,
      config_json,
    })
    res.json(updated)
  } catch (err) { next(err) }
}

export function publishLevelHandler(req, res, next) {
  try {
    if (!getLevelById(req.params.id)) return res.status(404).json({ message: 'Level not found' })
    const updated = setPublished(req.params.id, Boolean(req.body.published))
    res.json(updated)
  } catch (err) { next(err) }
}

export function deleteLevelHandler(req, res, next) {
  try {
    if (!deleteLevel(req.params.id)) return res.status(404).json({ message: 'Level not found' })
    res.status(204).end()
  } catch (err) { next(err) }
}
