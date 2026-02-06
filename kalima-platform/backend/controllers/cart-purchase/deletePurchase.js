const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const ECCoupon = require("../../models/ec.couponModel");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { getCurrentEgyptTime } = require("./helpers");

module.exports = catchAsync(async (req, res, next) => {
  const purchase = await ECCartPurchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  // this will be updated
  if (purchase.status === "confirmed" && purchase.couponCode) {
    const coupon = await ECCoupon.findById(purchase.couponCode);
    if (coupon) {
      await ECCoupon.findByIdAndUpdate(purchase.couponCode, {
        isActive: true,
        usedAt: null,
        appliedToPurchase: null,
        usedBy: null,
      });
    }
  }

  if (purchase.status === "confirmed" && purchase.confirmedBy) {
    const currentMonth = getCurrentEgyptTime();
    const monthStart = currentMonth.startOf("month").toJSDate();
    const monthEnd = currentMonth.endOf("month").toJSDate();

    const monthlyCount = await ECCartPurchase.countDocuments({
      confirmedBy: purchase.confirmedBy,
      status: "confirmed",
      confirmedAt: {
        $gte: monthStart,
        $lte: monthEnd,
      },
      _id: { $ne: purchase._id },
    });

    await User.findByIdAndUpdate(purchase.confirmedBy, {
      monthlyConfirmedCount: monthlyCount,
      lastConfirmedCountUpdate: new Date(),
    });
  }

  await User.findByIdAndUpdate(
    purchase.createdBy,
    {
      $inc: {
        numberOfPurchases: -1,
        TotalSpentAmount: -purchase.total,
      },
    },
    { new: true },
  );

  await ECCartPurchase.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Purchase deleted successfully",
  });
});
