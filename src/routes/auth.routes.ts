import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authentication } from '../middlewares/auth.middleware'

const router = Router()

router.post('/login', AuthController.login)
router.post('/confirm', AuthController.confirm)
router.post('/refresh', AuthController.refresh)
router.get('/me', authentication, AuthController.getMe)
router.patch('/me', authentication, AuthController.updateMe)

export default router