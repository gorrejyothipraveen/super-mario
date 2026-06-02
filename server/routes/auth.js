import { Router } from 'express'
import { issueToken } from '../controllers/authController.js'

const router = Router()
router.post('/token', issueToken)
export default router
