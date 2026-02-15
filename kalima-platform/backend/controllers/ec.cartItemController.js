// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart item controller logic.
const ECCartItem = require("../models/ec.cartItemModel");
const ECCart = require("../models/ec.cartModel");
const ECProduct = require("../models/ec.productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get all items in a cart
exports.getAllCartItems = catchAsync(async (req, res, next) => {
  const cartItems = await ECCartItem.find({ cart: req.params.cartId }).populate(
    {
      path: "product",
      select: "title thumbnail price priceAfterDiscount section",
    },
  );

  // Verify user owns this cart
  const cart = await ECCart.findById(req.params.cartId);
  if (!cart || cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Cart not found or unauthorized", 404));
  }

  res.status(200).json({
    status: "success",
    results: cartItems.length,
    data: { cartItems },
  });
});

// Get single cart item
exports.getCartItem = catchAsync(async (req, res, next) => {
  const cartItem = await ECCartItem.findById(req.params.itemId).populate({
    path: "product",
    select: "title thumbnail price priceAfterDiscount section",
  });

  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  // Verify user owns this cart
  const cart = await ECCart.findById(cartItem.cart);
  if (!cart || cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  res.status(200).json({
    status: "success",
    data: { cartItem },
  });
});

// Create new cart item
exports.createCartItem = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { cartId } = req.params;

  // Verify cart exists and belongs to user
  const cart = await ECCart.findById(cartId);
  if (!cart || cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Cart not found or unauthorized", 404));
  }

  // Check if product exists
  const product = await ECProduct.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if item already exists in cart
  const existingItem = await ECCartItem.findOne({
    cart: cartId,
    product: productId,
  });

  if (existingItem) {
    return next(new AppError("Item already exists in cart", 400));
  }

  // Create cart item
  const cartItem = await ECCartItem.create({
    cart: cartId,
    product: productId,
    quantity: quantity || 1,
    productType: product.__t || "ECProduct",
    priceAtAdd: product.priceAfterDiscount || product.price,
  });

  // Update cart totals
  await cart.updateTotals();

  // Return populated cart item
  await cartItem.populate({
    path: "product",
    select: "title thumbnail price priceAfterDiscount section",
  });

  res.status(201).json({
    status: "success",
    data: { cartItem },
  });
});

// Update cart item
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return next(new AppError("Invalid quantity", 400));
  }

  const cartItem = await ECCartItem.findById(itemId);
  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  // Verify user owns this cart
  const cart = await ECCart.findById(cartItem.cart);
  if (!cart || cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  cartItem.quantity = quantity;
  cartItem.updatePrice();
  await cartItem.save();
  await cart.updateTotals();

  await cartItem.populate({
    path: "product",
    select: "title thumbnail price priceAfterDiscount section",
  });

  res.status(200).json({
    status: "success",
    data: { cartItem },
  });
});

exports.deleteCartItem = catchAsync(async (req, res, next) => {
  const cartItem = await ECCartItem.findById(req.params.itemId);
  if (!cartItem) {
    return next(new AppError("Cart item not found", 404));
  }

  const cart = await ECCart.findById(cartItem.cart);
  if (!cart || cart.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 403));
  }

  await cartItem.deleteOne();
  await cart.updateTotals();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get cart item count
exports.getCartItemCount = catchAsync(async (req, res, next) => {
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  });

  if (!cart) {
    return res.status(200).json({
      status: "success",
      data: { count: 0 },
    });
  }

  const count = await ECCartItem.countDocuments({ cart: cart._id });

  res.status(200).json({
    status: "success",
    data: { count },
  });
});
