import { Router } from 'express'
import { merchantAuth } from '../middlewares/merchant-auth.middleware'
import { MerchantAuthController } from '../controllers/merchant-auth.controller'
import { validateBody } from '../middlewares/validate.middleware'
import { MerchantLoginDto } from '../dtos/merchant-auth.dto'

const router = Router()

router.post('/auth/login', validateBody(MerchantLoginDto), MerchantAuthController.login)
router.get('/auth/me', merchantAuth, MerchantAuthController.me)
router.get('/transactions', merchantAuth, MerchantAuthController.transactions)

export default router
