import { Router } from "express";
import { couponController } from "../../controllers/coupon.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

// ============================================
// ADMIN / SUBADMIN ONLY
// ============================================

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

router.get("/export", ...adminAuth, makeExportHandler("coupons"));

// Generate a unique coupon code (helper for admins)
router.get("/generate-code", ...adminAuth, couponController.generateCode);

// CRUD
router.post("/", ...adminAuth, couponController.createCoupon);
router.get("/", ...adminAuth, couponController.getAllCoupons);
router.get("/:id", ...adminAuth, couponController.getCouponById);
router.patch("/:id", ...adminAuth, couponController.updateCoupon);
router.delete("/:id", ...adminAuth, couponController.deleteCoupon);

// ============================================
// TEACHER ONLY
// ============================================

const teacherAuth = [authenticateToken, requireRole([role_enum.Teacher])];

// Validate & use coupon
router.post("/validate", ...teacherAuth, couponController.validateCoupon);
router.post("/use", ...teacherAuth, couponController.useCoupon);

export default router;
