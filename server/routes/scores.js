import { Router } from 'express'
import { submitScore, listLeaderboard, bestLeaderboard, playerHighScore } from '../controllers/scoreController.js'
import { sanitizeBody } from '../middleware/sanitize.js'
import { submitLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/',              submitLimiter, sanitizeBody(['username']), submitScore)
router.get('/',               listLeaderboard)
router.get('/best',           bestLeaderboard)        // must be before /:username
router.get('/:username/high', playerHighScore)

export default router
