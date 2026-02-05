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

  // 2. Get Rules from Helper
  const requirements = getCheckoutRequirements(cart.items);

  // 3. Send Response
  res.status(200).json({
    status: "success",
    data: {
      cart,
      ...requirements,
    },
  });
});
