import { Router } from 'express'
import { PaymentController } from '../controllers/payment.controller'
import { authentication } from '../middlewares/auth.middleware'
import { validateBody } from '../middlewares/validate.middleware'
import { NfcPaymentDto } from '../dtos/payment.dto'

const router = Router()

router.post('/nfc', authentication, validateBody(NfcPaymentDto), PaymentController.nfcPayment)
router.get('/history', authentication, PaymentController.history)
router.get('/cheque/:transactionId', authentication, PaymentController.getChequeDetails)
router.get('/cheque-simple/:transactionId', authentication, PaymentController.getCheque)

export default router
