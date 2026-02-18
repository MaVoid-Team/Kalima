import { Router } from 'express';
// import cartRoutes from './cart.routes';
import couponRoutes from './coupon.routes';

const router = Router();

// router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);

export default router;
