import { Router } from "express";
import { cartController } from "../../controllers/cart.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { uploadSingleImage } from "../../middleware/upload.middleware";

const router = Router();

// All cart endpoints require authentication
router.use(authenticateToken);

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
  uploadSingleImage("image"),
  cartController.updateCartItemRequiredFields,
);

// ============================================
// CHECKOUT
// ============================================

router.get("/checkout/preview", cartController.getCheckoutPreview);
router.post(
  "/checkout",
  uploadSingleImage("paymentScreenshot"),
  cartController.checkout,
);

export default router;
