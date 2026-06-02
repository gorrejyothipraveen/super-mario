import { upsertSave, getSave } from '../models/saveModel.js'

export function loadSave(req, res, next) {
  try {
    const save = getSave(req.params.username)
    if (!save) return res.status(404).json({ error: 'No save found for this player' })
    res.json(save)
  } catch (err) {
    next(err)
  }
}

export function writeSave(req, res, next) {
  try {
    const { username } = req.params
    const { levelIndex, score, unlockedLevels } = req.body

    if (
      typeof levelIndex !== 'number' ||
      typeof score !== 'number' ||
      !Array.isArray(unlockedLevels)
    ) {
      return res.status(400).json({
        error: 'levelIndex (number), score (number), unlockedLevels (array) are required',
      })
    }

    const save = upsertSave(username, levelIndex, score, unlockedLevels)
    res.json(save)
  } catch (err) {
    next(err)
  }
}
