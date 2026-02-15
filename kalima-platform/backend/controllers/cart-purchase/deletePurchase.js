// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase deletion logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const ECCoupon = require("../../models/ec.couponModel");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const {
  refreshMonthlyConfirmedCount,
} = require("./services/monthlyCountService");

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
    // Delete happens next, so count will already exclude this purchase
    await refreshMonthlyConfirmedCount(purchase.confirmedBy);
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

  // Re-count after deletion so the cache reflects the removed purchase
  if (purchase.status === "confirmed" && purchase.confirmedBy) {
    await refreshMonthlyConfirmedCount(purchase.confirmedBy);
  }

  res.status(200).json({
    status: "success",
    message: "Purchase deleted successfully",
  });
});
