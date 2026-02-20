// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart add item logic.
const ECCart = require("../../models/ec.cartModel");
const ECCartItem = require("../../models/ec.cartItemModel");
const ECProduct = require("../../models/ec.productModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { updateCartTotals } = require("./helper");

const checkCartItemType = async (cartId, product) => {
  const existingAnyItem = await ECCartItem.findOne({ cart: cartId }).select(
    "productType",
  );

  if (existingAnyItem) {
    const firstProductType = existingAnyItem.productType;
    const newProductType = product.__t || "ECProduct";

    if (newProductType !== firstProductType) return false;
  }

  return true;
};

const addItemToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const quantityToAdd = quantity && quantity > 0 ? parseInt(quantity) : 1;

  const [product, cart] = await Promise.all([
    ECProduct.findById(productId),
    ECCart.findOne({ user: userId, status: "active" }).select("_id"),
  ]);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  let cartId = cart ? cart._id : null;
  if (!cartId) {
    const newCart = await ECCart.create({
      user: userId,
      status: "active",
    });
    cartId = newCart._id;
  }

  if (!(await checkCartItemType(cartId, product))) {
    return next(new AppError("Cannot mix product types in the cart", 400));
  }

  let cartItem = await ECCartItem.findOne({
    cart: cartId,
    product: productId,
  });

  const price = product.priceAfterDiscount || product.price;

  if (cartItem) {
    cartItem.quantity += quantityToAdd;
    cartItem.finalPrice = cartItem.priceAtAdd * cartItem.quantity;
    await cartItem.save();

    // Trigger Totals
    await updateCartTotals(cartId);

    return res.status(200).json({
      status: "success",
      message: "Item quantity updated",
      action: "updated",
      data: cartItem,
    });
  }

  cartItem = await ECCartItem.create({
    cart: cartId,
    product: productId,
    quantity: quantityToAdd,
    productType: product.__t || "ECProduct",
    priceAtAdd: price,
    finalPrice: price * quantityToAdd,
    productSnapshot: {
      title: product.title,
      thumbnail: product.thumbnail,
      section: product.section,
      serial: product.serial,
      originalPrice: product.price,
      priceAfterDiscount: product.priceAfterDiscount,
    },
  });

  await ECCart.findByIdAndUpdate(cartId, { $push: { items: cartItem._id } });

  await updateCartTotals(cartId);

  res.status(201).json({
    status: "success",
    message: "Item added to cart",
    action: "created",
    data: cartItem,
  });
});

module.exports = addItemToCart;
