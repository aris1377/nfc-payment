import { Router } from 'express'
import { adminAuth } from '../middlewares/admin.middleware'
import { MerchantController } from '../controllers/merchant.controller'
import { validateBody } from '../middlewares/validate.middleware'
import { CreateMerchantDto, UpdateMerchantDto, CreateTerminalDto } from '../dtos/merchant.dto'

const router = Router()

router.use(adminAuth)

router.post('/merchants', validateBody(CreateMerchantDto), MerchantController.create)
router.get('/merchants', MerchantController.list)
router.get('/merchants/:uuid', MerchantController.get)
router.patch('/merchants/:uuid', validateBody(UpdateMerchantDto), MerchantController.update)
router.post('/merchants/:uuid/terminals', validateBody(CreateTerminalDto), MerchantController.createTerminal)

export default router
