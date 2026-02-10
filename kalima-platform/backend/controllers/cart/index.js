// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart controller exports.
const { checkout } = require("./checkout");
const { getCart } = require("./get-cart");
const addItem = require("./add-to-cart");
const { removeFromCart } = require("./remove-from-cart");
const { updateItemQuantity } = require("./update-item-quantity");
const { clearCart } = require("./clear-cart");
const { getCheckoutPreview } = require("./get-preview");
const { applyCoupon } = require("./apply-coupon");
const { removeCoupon } = require("./remove-coupon");

module.exports = {
  checkout,
  getCart,
  addItem,
  removeFromCart,
  updateItemQuantity,
  clearCart,
  getCheckoutPreview,
  applyCoupon,
  removeCoupon,
};
