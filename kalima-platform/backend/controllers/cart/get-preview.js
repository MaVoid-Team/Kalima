// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart preview logic.
const ECCart = require("../../models/ec.cartModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { getCheckoutRequirements } = require("./helper");

const getCheckoutPreview = catchAsync(async (req, res, next) => {
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).populate({
    path: "items",
    select: "productType finalPrice productSnapshot",
  });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  const requirements = getCheckoutRequirements(cart.items);

  res.status(200).json({
    status: "success",
    data: {
      cart,
      ...requirements,
    },
  });
});

module.exports = {
  getCheckoutPreview,
};
