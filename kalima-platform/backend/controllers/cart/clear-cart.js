// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart clearing logic.
const ECCart = require("../../models/ec.cartModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { clearCartItems } = require("./helper");

const clearCart = catchAsync(async (req, res, next) => {
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).select("_id");

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const emptyCart = await clearCartItems(cart._id);

  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
    data: {
      cart: emptyCart,
    },
  });
});

module.exports = {
  clearCart,
};
