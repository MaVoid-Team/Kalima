const ECCart = require("../../models/ec.cartModel");
const ECCartItem = require("../../models/ec.cartItemModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { updateCartTotals } = require("./helper");

const updateItemQuantity = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError("Quantity must be at least 1", 400));
  }

  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).select("_id");

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const cartItem = await ECCartItem.findOne({
    _id: itemId,
    cart: cart._id,
  });

  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  cartItem.quantity = parseInt(quantity);
  cartItem.finalPrice = cartItem.priceAtAdd * cartItem.quantity;
  await cartItem.save();

  await updateCartTotals(cart._id);

  res.status(200).json({
    status: "success",
    message: "Item quantity updated",
    data: cartItem,
  });
});

module.exports = {
  updateItemQuantity,
};
