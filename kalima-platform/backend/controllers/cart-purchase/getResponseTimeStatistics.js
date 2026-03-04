// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store response time statistics.
const { DateTime } = require("luxon");
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const {
  DEFAULT_STATS_START_DATE,
  calculateBusinessMinutes,
  formatMinutes,
  getCurrentEgyptTime,
} = require("./helpers");

module.exports = catchAsync(async (req, res) => {
  const startDate = req.query.startDate
    ? DateTime.fromISO(req.query.startDate)
        .setZone("Africa/Cairo")
        .startOf("day")
        .toJSDate()
    : DateTime.fromJSDate(DEFAULT_STATS_START_DATE)
        .setZone("Africa/Cairo")
        .startOf("day")
        .toJSDate();

  const endDate = req.query.endDate
    ? DateTime.fromISO(req.query.endDate)
        .setZone("Africa/Cairo")
        .endOf("day")
        .toJSDate()
    : getCurrentEgyptTime().endOf("day").toJSDate();

  const purchases = await ECCartPurchase.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).select("createdAt receivedAt confirmedAt status");

  const receiveStats = [];
  const confirmStats = [];
  const totalStats = [];
  const statusCounts = {};

  purchases.forEach((purchase) => {
    const status = purchase.status || "pending";
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (purchase.receivedAt) {
      const receiveMinutes = calculateBusinessMinutes(
        purchase.createdAt,
        purchase.receivedAt,
      );
      receiveStats.push(receiveMinutes);

      if (purchase.confirmedAt) {
        const confirmMinutes = calculateBusinessMinutes(
          purchase.receivedAt,
          purchase.confirmedAt,
        );
        confirmStats.push(confirmMinutes);

        const totalMinutes = calculateBusinessMinutes(
          purchase.createdAt,
          purchase.confirmedAt,
        );
        totalStats.push(totalMinutes);
      }
    }
  });

  const calculateStats = (minutes) => {
    if (!minutes || minutes.length === 0) return null;

    const sum = minutes.reduce((a, b) => a + b, 0);
    const average = sum / minutes.length;
    const max = Math.max(...minutes);
    const positive = minutes.filter((m) => m > 0);
    const min = positive.length ? Math.min(...positive) : 0;

    return {
      averageMinutes: formatMinutes(average),
      maxMinutes: formatMinutes(max),
      minMinutes: formatMinutes(min),
      count: minutes.length,
    };
  };

  res.status(200).json({
    status: "success",
    data: {
      period:
        req.query.startDate || req.query.endDate
          ? "Custom range"
          : "Current month",
      dateRange: {
        start: startDate,
        end: endDate,
        description:
          req.query.startDate || req.query.endDate
            ? "Custom date range"
            : `Since ${DateTime.fromJSDate(DEFAULT_STATS_START_DATE).toFormat("MMMM d, yyyy")}`,
      },
      receiveTime: calculateStats(receiveStats),
      confirmTime: calculateStats(confirmStats),
      totalResponseTime: calculateStats(totalStats),
      currentStatus: statusCounts,
    },
  });
});
