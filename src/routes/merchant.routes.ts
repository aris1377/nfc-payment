import { Router } from 'express'
import { merchantAuth } from '../middlewares/merchant-auth.middleware'
import { MerchantAuthController } from '../controllers/merchant-auth.controller'
import { validateBody } from '../middlewares/validate.middleware'
import { MerchantLoginDto } from '../dtos/merchant-auth.dto'
import { MerchantController } from '../controllers/merchant.controller'
import { PaymentController } from '../controllers/payment.controller'

const router = Router()

router.post(
	'/auth/login',
	validateBody(MerchantLoginDto),
	MerchantAuthController.login,
)
router.get('/auth/me', merchantAuth, MerchantAuthController.me)
router.get('/daily-revenue', merchantAuth, MerchantController.getDailyRevByUuid)
router.get('/transactions', merchantAuth, MerchantAuthController.transactions)
router.get(
	'/cheque/:transactionId',
	merchantAuth,
	PaymentController.getChequeDetails,
)
router.get(
	'/cheque-simple/:transactionId',
	merchantAuth,
	PaymentController.getCheque,
)

export default router
