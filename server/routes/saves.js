import { Router } from 'express'
import { loadSave, writeSave } from '../controllers/saveController.js'
import { sanitizeBody } from '../middleware/sanitize.js'

const router = Router()

router.get('/:username', loadSave)
router.put('/:username', sanitizeBody(['username']), writeSave)

export default router
