import { Router } from 'express'
import { adminAuth } from '../middlewares/admin.middleware'
import { MerchantController } from '../controllers/merchant.controller'

const router = Router()

router.use(adminAuth)

router.post('/merchants', MerchantController.create)
router.get('/merchants', MerchantController.list)
router.get('/merchants/:uuid', MerchantController.get)
router.patch('/merchants/:uuid', MerchantController.update)
router.post('/merchants/:uuid/terminals', MerchantController.createTerminal)

export default router
