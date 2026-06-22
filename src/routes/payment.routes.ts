import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller'
import { authentication } from '../middlewares/auth.middleware'


const router = Router();

router.get('/history', authentication, PaymentController.history);
router.post('/nfc', authentication, PaymentController.nfcPayment);


export default router;