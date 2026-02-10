// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart retrieval logic.
const ECCart = require("../../models/ec.cartModel");
const catchAsync = require("../../utils/catchAsync");

const getCart = catchAsync(async (req, res, next) => {
  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).populate({
    path: "itemsWithDetails",
    populate: [
      {
        path: "product",
        select: "title thumbnail price priceAfterDiscount section",
      },
      {
        path: "couponCode",
        select: "couponCode value expirationDate isActive",
      },
    ],
  });

  if (!cart) {
    return res.status(200).json({
      status: "success",
      data: {
        cart: null,
        itemCount: 0,
      },
    });
  }

  const itemCount = cart.items ? cart.items.length : 0;

  res.status(200).json({
    status: "success",
    data: {
      itemCount,
      cart,
    },
  });
});

module.exports = {
  getCart,
};
