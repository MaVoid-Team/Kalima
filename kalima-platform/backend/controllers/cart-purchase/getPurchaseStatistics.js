// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store purchase statistics.
const { DateTime } = require("luxon");
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");

module.exports = catchAsync(async (req, res) => {
  const overviewAgg = await ECCartPurchase.aggregate([
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        confirmedPurchases: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        pendingPurchases: {
          $sum: { $cond: [{ $ne: ["$status", "confirmed"] }, 1, 0] },
        },
        totalRevenue: { $sum: "$total" },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
        },
        averagePrice: { $avg: "$total" },
      },
    },
    {
      $project: {
        totalPurchases: 1,
        confirmedPurchases: 1,
        pendingPurchases: 1,
        totalRevenue: 1,
        confirmedRevenue: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
      },
    },
  ]);

  const startOfWindow = DateTime.now()
    .setZone("Africa/Cairo")
    .minus({ months: 11 })
    .startOf("month")
    .toJSDate();
  const monthlyStats = await ECCartPurchase.aggregate([
    { $match: { createdAt: { $gte: startOfWindow } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
        },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  let dailyStats = null;
  if (req.query.date) {
    const dt = DateTime.fromISO(req.query.date, { zone: "Africa/Cairo" });
    if (dt.isValid) {
      const startOfDay = dt.startOf("day").toJSDate();
      const endOfDay = dt.endOf("day").toJSDate();

      const [day] = await ECCartPurchase.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: 1 },
            confirmedPurchases: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            pendingPurchases: {
              $sum: { $cond: [{ $ne: ["$status", "confirmed"] }, 1, 0] },
            },
            totalRevenue: { $sum: "$total" },
            confirmedRevenue: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
            },
            averagePrice: { $avg: "$total" },
          },
        },
        {
          $project: {
            totalPurchases: 1,
            confirmedPurchases: 1,
            pendingPurchases: 1,
            totalRevenue: 1,
            confirmedRevenue: 1,
            averagePrice: { $round: ["$averagePrice", 2] },
          },
        },
      ]);

      dailyStats = day || {
        totalPurchases: 0,
        confirmedPurchases: 0,
        pendingPurchases: 0,
        totalRevenue: 0,
        confirmedRevenue: 0,
        averagePrice: 0,
      };
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      overview: overviewAgg[0] || {
        totalPurchases: 0,
        confirmedPurchases: 0,
        pendingPurchases: 0,
        totalRevenue: 0,
        confirmedRevenue: 0,
        averagePrice: 0,
      },
      monthlyStats,
      dailyStats,
    },
  });
});
