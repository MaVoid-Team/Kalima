import { Router } from 'express';
// import cartRoutes from './cart.routes';
import couponRoutes from './coupon.routes';
import requiredFieldRoutes from './required-field.routes';
import categoryRoutes from './category.routes';

const router = Router();

// router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/required-fields', requiredFieldRoutes);
router.use('/categories', categoryRoutes);

export default router;
