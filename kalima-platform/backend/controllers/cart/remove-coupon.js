const ECCart = require("../../models/ec.cartModel");
const ECCartItem = require("../../models/ec.cartItemModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { updateCartTotals } = require("./helper");

const removeCoupon = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  if (!itemId) {
    return next(new AppError("Item ID is required", 400));
  }

  // Find user's active cart
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).select("_id");

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Find the cart item
  const cartItem = await ECCartItem.findOne({
    _id: itemId,
    cart: cart._id,
  });

  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  if (!cartItem.couponCode) {
    return next(new AppError("This item does not have a coupon applied", 400));
  }

  // Remove coupon from item
  cartItem.couponCode = null;
  cartItem.discount = 0;
  await cartItem.save();

  // Recalculate cart totals
  await updateCartTotals(cart._id);

  res.status(200).json({
    status: "success",
    message: "Coupon removed from item successfully",
    data: cartItem,
  });
});

module.exports = {
  removeCoupon,
};
