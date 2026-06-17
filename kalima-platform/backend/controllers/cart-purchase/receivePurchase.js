// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store purchase receiving logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { getCurrentEgyptTime } = require("./helpers");

module.exports = catchAsync(async (req, res, next) => {
  const purchase = await ECCartPurchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  if (purchase.status !== "pending") {
    return next(new AppError(`Purchase is already ${purchase.status}`, 400));
  }

  const now = getCurrentEgyptTime().toJSDate();
  await ECCartPurchase.findByIdAndUpdate(
    req.params.id,
    {
      status: "received",
      receivedBy: req.user._id,
      receivedAt: now,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: "success",
    message: "Purchase marked as received successfully",
  });
});
