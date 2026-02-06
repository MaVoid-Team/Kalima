const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { getCurrentEgyptTime } = require("./helpers");
const {
  refreshMonthlyConfirmedCount,
} = require("./services/monthlyCountService");

module.exports = catchAsync(async (req, res, next) => {
  const purchase = await ECCartPurchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  if (purchase.status === "confirmed") {
    return next(new AppError("Purchase is already confirmed", 400));
  }

  if (!["received", "returned"].includes(purchase.status)) {
    return next(
      new AppError(
        "Purchase must be received or in returned status before it can be confirmed",
        400,
      ),
    );
  }

  const now = getCurrentEgyptTime().toJSDate();
  await ECCartPurchase.findByIdAndUpdate(
    req.params.id,
    {
      status: "confirmed",
      confirmedBy: req.user._id,
      confirmedAt: now,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  await refreshMonthlyConfirmedCount(req.user._id);

  res.status(200).json({
    status: "success",
    message: "Purchase confirmed successfully",
  });
});
