const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { getCurrentEgyptTime } = require("./helpers");

module.exports = catchAsync(async (req, res, next) => {
  const purchase = await ECCartPurchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  if (!["confirmed", "received"].includes(purchase.status)) {
    return next(
      new AppError("Only confirmed or received purchases can be returned", 400),
    );
  }

  if (purchase.status === "returned") {
    return next(new AppError("Purchase is already returned", 400));
  }

  const now = getCurrentEgyptTime().toJSDate();
  await ECCartPurchase.findByIdAndUpdate(
    req.params.id,
    {
      status: "returned",
      returnedAt: now,
      returnedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    message: "Purchase returned successfully",
  });
});
