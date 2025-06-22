const express = require("express");
const couponController = require("../controllers/ec.couponController");
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

// Protect all routes after this middleware
router.use(verifyJWT);

// Admin and subadmin can create coupons
router.post(
  "/",
  authController.verifyRoles("admin", "subadmin"),
  couponController.createCoupon
);

// Get all coupons (admin only)
router.get(
  "/",
  authController.verifyRoles("admin", "subadmin"),
  couponController.getAllCoupons
);

// Get active coupons
router.get(
  "/active",
  authController.verifyRoles("admin", "subadmin", "moderator"),
  couponController.getActiveCoupons
);

// Get used coupons
router.get(
  "/used",
  authController.verifyRoles("admin", "subadmin", "moderator"),
  couponController.getUsedCoupons
);

// Use a coupon
router.post(
  "/use",
  authController.verifyRoles("student", "parent", "teacher"),
  couponController.useCoupon
);

// Validate a coupon (available to students)
router.post(
  "/validate",
  authController.verifyRoles("student", "parent", "teacher", "admin", "subadmin", "moderator"),
  couponController.validateCoupon
);


// Delete coupon (admin and subadmin only)
router.delete(
  "/:id",
  authController.verifyRoles("admin", "subadmin"),
  couponController.deleteCoupon
);

// Get coupon by ID
router.get(
  "/:id",
  authController.verifyRoles("admin", "subadmin", "moderator"),
  couponController.getCouponById
);

module.exports = router;