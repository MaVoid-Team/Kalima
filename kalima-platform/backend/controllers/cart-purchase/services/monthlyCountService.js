// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store monthly count service.
const { DateTime } = require("luxon");
const ECCartPurchase = require("../../../models/ec.cartPurchaseModel");
const User = require("../../../models/userModel");
const { getCurrentEgyptTime } = require("../helpers");

/**
 * Shared helper — recounts monthly confirmed purchases for a user and
 * persists the cached value on the User document.
 *
 * Used by:
 *  • confirmCartPurchase  (eager cache after each confirm)
 *  • getMonthlyConfirmedPurchasesCount  (lazy cache on read)
 */
async function refreshMonthlyConfirmedCount(userId) {
  const now = getCurrentEgyptTime();
  const monthStart = now.startOf("month").toJSDate();
  const monthEnd = now.endOf("month").toJSDate();

  const count = await ECCartPurchase.countDocuments({
    confirmedBy: userId,
    status: "confirmed",
    confirmedAt: { $gte: monthStart, $lte: monthEnd },
  });

  await User.findByIdAndUpdate(userId, {
    monthlyConfirmedCount: count,
    lastConfirmedCountUpdate: new Date(),
  });

  return count;
}

/**
 * Returns true when the cached count on the User doc is stale
 * (never set, or belongs to a previous month).
 */
function isCacheStale(user) {
  if (!user?.lastConfirmedCountUpdate) return true;

  const now = getCurrentEgyptTime();
  const lastUpdate = DateTime.fromJSDate(user.lastConfirmedCountUpdate).setZone(
    "Africa/Cairo",
  );

  return (
    lastUpdate.startOf("month").toMillis() !== now.startOf("month").toMillis()
  );
}

module.exports = { refreshMonthlyConfirmedCount, isCacheStale };
