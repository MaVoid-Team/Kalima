// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store v2 cart routes.
const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/cart");
const verifyJWT = require("../../middleware/verifyJWT");

// Protect all routes
router.use(verifyJWT);

// Cart management
router.get("/", cartController.getCart);
router.post("/add", cartController.addItem);
router.patch("/items/:itemId/quantity", cartController.updateItemQuantity);
router.delete("/items/:itemId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

// Per-item coupon management
router.post("/items/apply-coupon", cartController.applyCoupon);
router.delete("/items/:itemId/coupon", cartController.removeCoupon);

// Checkout
router.get("/checkout-preview", cartController.getCheckoutPreview);

module.exports = router;
