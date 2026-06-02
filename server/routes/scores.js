import { Router } from 'express'
import { submitScore, listLeaderboard, bestLeaderboard, playerHighScore } from '../controllers/scoreController.js'

const router = Router()

router.post('/', submitScore)
router.get('/', listLeaderboard)
router.get('/best', bestLeaderboard)        // must be before /:username
router.get('/:username/high', playerHighScore)

export default router
