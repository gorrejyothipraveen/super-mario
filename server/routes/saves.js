import { Router } from 'express'
import { loadSave, writeSave } from '../controllers/saveController.js'

const router = Router()

router.get('/:username', loadSave)
router.put('/:username', writeSave)

export default router
