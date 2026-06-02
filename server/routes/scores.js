import { Router } from 'express'
import { submitScore, listLeaderboard, playerHighScore } from '../controllers/scoreController.js'

const router = Router()

router.post('/', submitScore)
router.get('/', listLeaderboard)
router.get('/:username/high', playerHighScore)

export default router
