import { Router } from 'express'
import { adminAuth } from '../middleware/adminAuth.js'
import { sanitizeBody } from '../middleware/sanitize.js'
import {
  listLevels, getLevel, createLevelHandler,
  updateLevelHandler, publishLevelHandler, deleteLevelHandler,
} from '../controllers/levelController.js'

const router = Router()

router.get('/',              listLevels)
router.get('/:id',           getLevel)
router.post('/',             adminAuth, sanitizeBody(['name', 'background']), createLevelHandler)
router.put('/:id',           adminAuth, sanitizeBody(['name', 'background']), updateLevelHandler)
router.patch('/:id/publish', adminAuth, publishLevelHandler)
router.delete('/:id',        adminAuth, deleteLevelHandler)

export default router
