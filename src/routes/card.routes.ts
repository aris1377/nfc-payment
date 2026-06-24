import { Router } from 'express'
import { CardController } from '../controllers/card.controller'
import { authentication } from '../middlewares/auth.middleware'
import { validateBody } from '../middlewares/validate.middleware'
import { RegisterCardDto, ConfirmCardDto } from '../dtos/card.dto'

const router = Router()

router.post('/register', authentication, CardController.register)
router.post('/confirm', authentication, validateBody(ConfirmCardDto), CardController.confirm)
router.get('/', authentication, CardController.list)
router.get('/:id', authentication, CardController.get)
router.delete('/:id', authentication, CardController.delete)

export default router
