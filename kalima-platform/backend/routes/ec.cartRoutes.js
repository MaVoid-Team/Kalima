// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart routes.
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/ec.cartController");
const cartItemRouter = require("./ec.cartItemRoutes");
const verifyJWT = require("../middleware/verifyJWT");

// Protect all routes
router.use(verifyJWT);

// Forward cart item routes
router.use("/:cartId/items", cartItemRouter);

// Cart management routes
router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.delete("/remove-item/:itemId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);

// Coupon routes
router.post("/apply-coupon", cartController.applyCoupon);

// Checkout preview
router.get("/checkout-preview", cartController.getCheckoutPreview);

module.exports = router;
