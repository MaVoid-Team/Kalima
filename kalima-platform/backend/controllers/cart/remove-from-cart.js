// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart item removal logic.
const ECCart = require("../../models/ec.cartModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { removeItemFromCart } = require("./helper");

const removeFromCart = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).select("_id");

  if (!cart) {
    return next(new AppError(`There is no active cart for the user`, 404));
  }

  await removeItemFromCart(cart._id, itemId);

  res.status(200).json({
    status: "success",
    message: "Item removed from cart successfully",
  });
});

module.exports = {
  removeFromCart,
};
