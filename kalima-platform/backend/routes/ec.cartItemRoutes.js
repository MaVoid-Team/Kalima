// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart item routes.
const express = require("express");
const router = express.Router({ mergeParams: true }); // This allows us to access params from parent router
const cartItemController = require("../controllers/ec.cartItemController");
const verifyJWT = require("../middleware/verifyJWT");

// Protect all routes
router.use(verifyJWT);

router.get("/count", cartItemController.getCartItemCount);

// Cart items routes
router
  .route("/")
  .get(cartItemController.getAllCartItems)
  .post(cartItemController.createCartItem);

router
  .route("/:itemId")
  .get(cartItemController.getCartItem)
  .patch(cartItemController.updateCartItem)
  .delete(cartItemController.deleteCartItem);

module.exports = router;
