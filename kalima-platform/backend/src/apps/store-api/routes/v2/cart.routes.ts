import { Router } from "express";
import { cartController } from "../../controllers/cart.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { uploadSingleImage } from "../../middleware/upload.middleware";
import { requireConfirmed } from "../../middleware/requireConfirmed.middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/enums";

const router = Router();

// All cart endpoints require authentication

const adminAuth = [authenticateToken, requireRole([role_enum.Teacher])];

router.use(adminAuth);

// ============================================
// CART CRUD
// ============================================

router.get("/", cartController.getCart);
router.post("/items", uploadSingleImage("image"), cartController.addItem);
router.patch("/items/:itemId/quantity", cartController.updateItemQuantity);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

// ============================================
// COUPON
// ============================================

router.post("/items/coupon", cartController.applyCoupon);
router.delete("/items/:itemId/coupon", cartController.removeCoupon);

// ============================================
// REQUIRED FIELDS
// ============================================

router.patch(
  "/items/required-fields",
  cartController.updateCartItemRequiredFields,
);

router.patch(
  "/items/required-fields/image",
  uploadSingleImage("image"),
  cartController.updateCartItemRequiredFieldImage,
);

// ============================================
// CHECKOUT
// ============================================

router.get("/checkout/preview", cartController.getCheckoutPreview);
router.get(
  "/checkout/repeat-purchases",
  cartController.getRepeatPurchaseItems,
);
router.post(
  "/checkout",
  requireConfirmed,
  uploadSingleImage("paymentScreenshot"),
  cartController.checkout,
);

// ============================================
// FAST BUY CART (Standalone parallel cart)
// ============================================

router.post("/fast-buy/start", cartController.startFastBuy);
router.get("/fast-buy", cartController.getFastBuyCart);
router.delete("/fast-buy", cartController.clearFastBuyCart);

router.post("/fast-buy/items/coupon", cartController.applyFastBuyCoupon);

router.patch(
  "/fast-buy/items/required-fields",
  cartController.updateFastBuyItemRequiredFields,
);

router.patch(
  "/fast-buy/items/required-fields/image",
  uploadSingleImage("image"),
  cartController.updateFastBuyItemRequiredFieldImage,
);

router.get(
  "/fast-buy/checkout/preview",
  cartController.getFastBuyCheckoutPreview,
);
router.post(
  "/fast-buy/checkout",
  requireConfirmed,
  uploadSingleImage("paymentScreenshot"),
  cartController.fastBuyCheckout,
);

export default router;
