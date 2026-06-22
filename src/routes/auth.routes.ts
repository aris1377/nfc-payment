import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router = Router()

router.post('/login', AuthController.login)
router.post('/confirm', AuthController.confirm)
router.post('/refresh', AuthController.refresh)

export default router