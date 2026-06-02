import { Router } from 'express'
import { reportError } from '../controllers/errorController.js'

const router = Router()
router.post('/', reportError)
export default router
