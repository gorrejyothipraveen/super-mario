import { Router } from 'express'
import { adminAuth } from '../middleware/adminAuth.js'
import {
  listLevels, getLevel, createLevelHandler,
  updateLevelHandler, publishLevelHandler, deleteLevelHandler,
} from '../controllers/levelController.js'

const router = Router()

router.get('/',             listLevels)                          // public (filters unpublished)
router.get('/:id',          getLevel)                            // public
router.post('/',            adminAuth, createLevelHandler)        // admin
router.put('/:id',          adminAuth, updateLevelHandler)        // admin
router.patch('/:id/publish', adminAuth, publishLevelHandler)      // admin
router.delete('/:id',       adminAuth, deleteLevelHandler)        // admin

export default router
