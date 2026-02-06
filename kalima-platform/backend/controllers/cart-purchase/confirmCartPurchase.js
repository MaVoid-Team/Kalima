const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { getCurrentEgyptTime } = require("./helpers");

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

  const currentMonth = getCurrentEgyptTime();
  const monthStart = currentMonth.startOf("month").toJSDate();
  const monthEnd = currentMonth.endOf("month").toJSDate();

  const monthlyCount = await ECCartPurchase.countDocuments({
    confirmedBy: req.user._id,
    status: "confirmed",
    confirmedAt: {
      $gte: monthStart,
      $lte: monthEnd,
    },
  });

  await User.findByIdAndUpdate(req.user._id, {
    monthlyConfirmedCount: monthlyCount,
    lastConfirmedCountUpdate: new Date(),
  });

  res.status(200).json({
    status: "success",
    message: "Purchase confirmed successfully",
  });
});
