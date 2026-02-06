const { DateTime } = require("luxon");
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const { getCurrentEgyptTime } = require("./helpers");

module.exports = catchAsync(async (req, res) => {
  const now = getCurrentEgyptTime();
  const monthStart = now.startOf("month").toJSDate();
  const monthEnd = now.endOf("month").toJSDate();

  const user = await User.findById(req.user._id).select(
    "monthlyConfirmedCount lastConfirmedCountUpdate",
  );

  let count = user?.monthlyConfirmedCount || 0;
  let needsRecalculation = false;

  if (!user?.lastConfirmedCountUpdate) {
    needsRecalculation = true;
  } else {
    const lastUpdate = DateTime.fromJSDate(
      user.lastConfirmedCountUpdate,
    ).setZone("Africa/Cairo");
    const lastUpdateMonth = lastUpdate.startOf("month").toJSDate();
    if (lastUpdateMonth.getTime() !== monthStart.getTime()) {
      needsRecalculation = true;
    }
  }

  if (needsRecalculation) {
    count = await ECCartPurchase.countDocuments({
      confirmedBy: req.user._id,
      status: "confirmed",
      confirmedAt: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

    await User.findByIdAndUpdate(req.user._id, {
      monthlyConfirmedCount: count,
      lastConfirmedCountUpdate: new Date(),
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      confirmedPurchasesCount: count,
      month: now.toFormat("MMMM yyyy"),
    },
  });
});
