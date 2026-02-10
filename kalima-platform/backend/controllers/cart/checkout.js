// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart checkout logic.
const ECCart = require("../../models/ec.cartModel");
const catchAsync = require("../../utils/catchAsync");
const mongoose = require("mongoose");
const AppError = require("../../utils/appError");
const {
  validateCheckoutRules,
  createPurchaseRecords,
  clearCartItems,
} = require("./helper");

const checkout = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await ECCart.findOne({
    user: userId,
    status: "active",
  }).populate({
    path: "items",
    populate: { path: "product", select: "title _id priceAtAdd finalPrice" },
  });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  if (!cart.items || cart.items.length === 0) {
    return next(new AppError("Cannot checkout with empty cart", 400));
  }

  if (req.file) {
    req.body.paymentScreenShot = req.file.path;
  }

  validateCheckoutRules(cart.items, req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchases = await createPurchaseRecords(
      req.user,
      cart.items,
      req.body,
      session,
    );

    await clearCartItems(cart._id, session);

    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      message: "Checkout successful",
      data: {
        count: purchases.length,
        purchases,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    return next(new AppError(`Checkout failed: ${err.message}`, 500));
  } finally {
    session.endSession();
  }
});

module.exports = {
  checkout,
};
