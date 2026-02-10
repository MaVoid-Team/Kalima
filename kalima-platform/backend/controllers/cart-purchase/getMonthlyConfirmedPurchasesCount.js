// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store monthly confirmed purchase stats.
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const { getCurrentEgyptTime } = require("./helpers");
const {
  refreshMonthlyConfirmedCount,
  isCacheStale,
} = require("./services/monthlyCountService");

module.exports = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "monthlyConfirmedCount lastConfirmedCountUpdate",
  );

  let count = user?.monthlyConfirmedCount || 0;

  if (isCacheStale(user)) {
    count = await refreshMonthlyConfirmedCount(req.user._id);
  }

  const now = getCurrentEgyptTime();
  res.status(200).json({
    status: "success",
    data: {
      confirmedPurchasesCount: count,
      month: now.toFormat("MMMM yyyy"),
    },
  });
});
