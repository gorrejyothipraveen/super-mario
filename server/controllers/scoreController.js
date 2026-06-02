import { saveScore, getLeaderboard, getHighScore, getBestPerPlayer } from '../models/scoreModel.js'

export function submitScore(req, res, next) {
  try {
    const { username, score } = req.body
    if (!username || typeof score !== 'number') {
      return res.status(400).json({ error: 'username (string) and score (number) are required' })
    }
    const saved = saveScore(username, score)
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
}

export function listLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)
    res.json(getLeaderboard(limit))
  } catch (err) {
    next(err)
  }
}

export function bestLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)
    res.json(getBestPerPlayer(limit))
  } catch (err) {
    next(err)
  }
}

export function playerHighScore(req, res, next) {
  try {
    const { username } = req.params
    const entry = getHighScore(username)
    if (!entry) return res.status(404).json({ error: 'No scores found for this player' })
    res.json(entry)
  } catch (err) {
    next(err)
  }
}
