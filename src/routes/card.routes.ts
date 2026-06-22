import { Router } from 'express'
import { CardController } from '../controllers/card.controller'
import { authentication } from '../middlewares/auth.middleware'
// Yangi middleware import qilindi

const router = Router()
// 1. Token tekshiriladi -> 2. req.userId ga ID joylanadi

router.post('/register', authentication, CardController.register)
router.post('/confirm', authentication, CardController.confirm)
router.get('/', authentication, CardController.list)
router.get('/:id', authentication, CardController.get)
router.delete('/:id', authentication, CardController.delete)

export default router
