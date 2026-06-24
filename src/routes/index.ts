import { Router } from 'express';
import authRoutes from './auth.routes'
import cardRoutes from './card.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import merchantRoutes from './merchant.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/cards', cardRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/merchant', merchantRoutes);

export default router;