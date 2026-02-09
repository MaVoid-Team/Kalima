const ECCart = require("../../models/ec.cartModel");
const ECCartItem = require("../../models/ec.cartItemModel");
const ECCoupon = require("../../models/ec.couponModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { updateCartTotals } = require("./helper");

const applyCoupon = catchAsync(async (req, res, next) => {
  const { couponCode, itemId } = req.body;

  if (!couponCode) {
    return next(new AppError("Coupon code is required", 400));
  }

  if (!itemId) {
    return next(new AppError("Item ID is required", 400));
  }

  // Find and validate coupon
  const coupon = await ECCoupon.findOne({ couponCode });
  if (!coupon) {
    return next(new AppError("Invalid coupon code", 400));
  }

  if (!coupon.isActive) {
    return next(new AppError("This coupon has already been used", 400));
  }

  if (coupon.expirationDate && new Date() > coupon.expirationDate) {
    return next(new AppError("Coupon has expired", 400));
  }

  // Find user's active cart
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).select("_id items");

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

  // Check if this item already has a coupon applied
  if (cartItem.couponCode) {
    return next(
      new AppError(
        "This item already has a coupon applied. Remove it first before applying a new one",
        400,
      ),
    );
  }

  // Check if this coupon is already applied to another item in the cart
  const couponAlreadyUsed = await ECCartItem.findOne({
    cart: cart._id,
    couponCode: coupon._id,
    _id: { $ne: itemId },
  });

  if (couponAlreadyUsed) {
    return next(
      new AppError("This coupon is already applied to another item in your cart", 400),
    );
  }

  // Apply coupon to the item
  cartItem.couponCode = coupon._id;
  cartItem.discount = coupon.value;
  await cartItem.save();

  // Recalculate cart totals
  await updateCartTotals(cart._id);

  res.status(200).json({
    status: "success",
    message: "Coupon applied to item successfully",
    data: cartItem,
  });
});

module.exports = {
  applyCoupon,
};
