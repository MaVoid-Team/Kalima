const ECCartItem = require("../../models/ec.cartItemModel");
const ECProduct = require("../../models/ec.productModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
import { updateCartTotals } from "./helper";

const checkCartItemType = async (cartId, product) => {
  const existingAnyItem = await ECCartItem.findOne({ cart: cartId }).select(
    "productType",
  );

  if (existingAnyItem) {
    const firstProductType = existingAnyItem.productType;
    const newProductType = product.__t || "ECProduct"; // Mongoose discriminator key

    if (newProductType !== firstProductType) {
      return next(
        new AppError(
          `Cannot mix types. Cart has ${firstProductType}, you tried adding ${newProductType}`,
          400,
        ),
      );
    }
  }
};

const addToCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  const [product, cart] = await Promise.all([
    ECProduct.findById(productId).select("_id"),
    ECCart.findOne({ user: req.user._id, status: "active" }).select("_id"),
  ]);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  let cartId = cart ? cart._id : null;
  if (!cartId) {
    const newCart = await ECCart.create({
      user: req.user._id,
      status: "active",
    });
    cartId = newCart._id;
  }

  await checkCartItemType(cartId, product);

  let cartItem = await ECCartItem.findOne({
    cart: cartId,
    product: productId,
  });

  const price = product.priceAfterDiscount || product.price;

  if (cartItem) {
    cartItem.quantity += 1;
    cartItem.finalPrice = cartItem.priceAtAdd * cartItem.quantity;
    await cartItem.save();

    await updateCartTotals(cartId);

    res.status(200).json({
      tatus: "success",
      message: "Item already in cart. Quantity updated.",
      action: "updated",
      data: cartItem,
    });
  } else {
    cartItem = await ECCartItem.create({
      cart: cartId,
      product: productId,
      quantity: 1,
      productType: product.__t || "ECProduct",
      priceAtAdd: price,
      finalPrice: price,
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

    res.status(200).json({
      status: "success",
      message: "Item added to cart",
      action: "created",
      data: cartItem,
    });
  }
});

module.exports = {
  addToCart,
};
