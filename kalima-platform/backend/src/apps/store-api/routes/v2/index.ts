import { Router } from "express";
// import cartRoutes from './cart.routes';
import couponRoutes from "./coupon.routes";
import requiredFieldRoutes from "./required-field.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import sampleRoutes from "./sample.routes";
import governmentRoutes from "./government.routes";
import zonesRoutes from "./zones.routes";
import sitesRoutes from "./sites.routes";
import socialMediaRoutes from "./social-media.routes";
import levelsRoutes from "./levels.routes";
import subjectsRoutes from "./subjects.routes";
import teachesAtRoutes from "./teaches-at.routes";
import parentChildrenRoutes from "./parent-children.routes";

const router = Router();

// router.use('/cart', cartRoutes);
router.use("/coupons", couponRoutes);
router.use("/required-fields", requiredFieldRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/samples", sampleRoutes);

// New geography & social-media endpoints
router.use("/governments", governmentRoutes);
router.use("/zones", zonesRoutes);
router.use("/sites", sitesRoutes);
router.use("/social-media", socialMediaRoutes);
router.use("/levels", levelsRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/teaches-at", teachesAtRoutes);
router.use("/parent-children", parentChildrenRoutes);

export default router;
