import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authentication } from '../middlewares/auth.middleware'
import { validateBody } from '../middlewares/validate.middleware'
import { LoginDto, ConfirmOtpDto, RefreshTokenDto, UpdateMeDto } from '../dtos/auth.dto'

const router = Router()

router.post('/login', validateBody(LoginDto), AuthController.login)
router.post('/confirm', validateBody(ConfirmOtpDto), AuthController.confirm)
router.post('/refresh', validateBody(RefreshTokenDto), AuthController.refresh)
router.get('/me', authentication, AuthController.getMe)
router.patch('/me', authentication, validateBody(UpdateMeDto), AuthController.updateMe)

export default router
