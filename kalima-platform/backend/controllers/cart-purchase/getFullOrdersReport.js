const { DateTime } = require("luxon");
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const { calculateBusinessMinutes, formatMinutes } = require("./helpers");

const egyptTimeToUTC = (dateStr, timeStr, period) => {
  if (!dateStr) return null;

  try {
    let hour24 = 0;
    let minutes = 0;

    if (timeStr && period) {
      const [hours, mins] = timeStr.split(":").map(Number);
      if (
        Number.isNaN(hours) ||
        Number.isNaN(mins) ||
        hours < 1 ||
        hours > 12 ||
        mins < 0 ||
        mins > 59
      ) {
        throw new Error("Invalid time format");
      }

      hour24 = hours;
      if (period.toUpperCase() === "AM") {
        if (hours === 12) hour24 = 0;
      } else if (period.toUpperCase() === "PM") {
        if (hours !== 12) hour24 = hours + 12;
      }
      minutes = mins;
    }

    const dt = DateTime.fromISO(
      `${dateStr}T${String(hour24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
      {
        zone: "Africa/Cairo",
      },
    );

    return dt.toJSDate();
  } catch (error) {
    console.error("Error parsing Egypt time:", error);
    return null;
  }
};

module.exports = catchAsync(async (req, res) => {
  const { startDate, startTime, startPeriod, endDate, endTime, endPeriod } =
    req.query;
  const dateFilter = {};

  if (startDate || endDate) {
    if (startDate) {
      dateFilter.createdAt = dateFilter.createdAt || {};
      const startDateTime = egyptTimeToUTC(startDate, startTime, startPeriod);
      if (startDateTime) {
        dateFilter.createdAt.$gte = startDateTime;
      }
    }

    if (endDate) {
      dateFilter.createdAt = dateFilter.createdAt || {};
      let endDateTime;
      if (endTime && endPeriod) {
        endDateTime = egyptTimeToUTC(endDate, endTime, endPeriod);
      } else {
        endDateTime = egyptTimeToUTC(endDate, "11:59", "PM");
      }

      if (endDateTime) {
        dateFilter.createdAt.$lte = endDateTime;
      }
    }
  }

  const pipeline = [
    {
      $match: {
        status: { $in: ["confirmed", "returned", "received"] },
        ...dateFilter,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receivedBy",
        foreignField: "_id",
        as: "receivedByUser",
      },
    },
    {
      $unwind: {
        path: "$receivedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "confirmedBy",
        foreignField: "_id",
        as: "confirmedByUser",
      },
    },
    {
      $unwind: {
        path: "$confirmedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "returnedBy",
        foreignField: "_id",
        as: "returnedByUser",
      },
    },
    {
      $unwind: {
        path: "$returnedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        receivedBy: {
          _id: "$receivedByUser._id",
          name: "$receivedByUser.name",
          email: "$receivedByUser.email",
          role: "$receivedByUser.role",
        },
        receivedAt: 1,
        confirmedBy: {
          _id: "$confirmedByUser._id",
          name: "$confirmedByUser.name",
          email: "$confirmedByUser.email",
          role: "$confirmedByUser.role",
        },
        confirmedAt: 1,
        returnedBy: {
          _id: "$returnedByUser._id",
          name: "$returnedByUser.name",
          email: "$returnedByUser.email",
          role: "$returnedByUser.role",
        },
        returnedAt: 1,
        createdAt: 1,
        items: 1,
        status: 1,
      },
    },
  ];

  const allPurchases = await ECCartPurchase.aggregate(pipeline);
  const staffStats = {};

  allPurchases.forEach((purchase) => {
    if (
      purchase.receivedBy &&
      ["Admin", "SubAdmin", "Moderator"].includes(purchase.receivedBy.role)
    ) {
      const receiverId = purchase.receivedBy._id.toString();

      if (!staffStats[receiverId]) {
        staffStats[receiverId] = {
          staff: {
            id: purchase.receivedBy._id,
            name: purchase.receivedBy.name,
            email: purchase.receivedBy.email,
            role: purchase.receivedBy.role,
          },
          totalReceivedOrders: 0,
          totalConfirmedOrders: 0,
          totalConfirmedItems: 0,
          totalReturnedOrders: 0,
          totalReturnedItems: 0,
          responseTimesMinutes: [],
          confirmationTimesMinutes: [],
        };
      }

      staffStats[receiverId].totalReceivedOrders++;

      if (purchase.confirmedBy) {
        const responseMinutes = calculateBusinessMinutes(
          purchase.createdAt,
          purchase.receivedAt,
        );
        staffStats[receiverId].responseTimesMinutes.push(responseMinutes);
      }
    }

    if (
      purchase.confirmedBy &&
      ["Admin", "SubAdmin", "Moderator"].includes(purchase.confirmedBy.role)
    ) {
      const confirmerId = purchase.confirmedBy._id.toString();

      if (!staffStats[confirmerId]) {
        staffStats[confirmerId] = {
          staff: {
            id: purchase.confirmedBy._id,
            name: purchase.confirmedBy.name,
            email: purchase.confirmedBy.email,
            role: purchase.confirmedBy.role,
          },
          totalReceivedOrders: 0,
          totalConfirmedOrders: 0,
          totalConfirmedItems: 0,
          totalReturnedOrders: 0,
          totalReturnedItems: 0,
          responseTimesMinutes: [],
          confirmationTimesMinutes: [],
        };
      }

      staffStats[confirmerId].totalConfirmedOrders++;
      staffStats[confirmerId].totalConfirmedItems +=
        purchase.items?.length || 0;

      if (purchase.receivedAt && purchase.confirmedAt) {
        const confirmMinutes = calculateBusinessMinutes(
          purchase.receivedAt,
          purchase.confirmedAt,
        );
        staffStats[confirmerId].confirmationTimesMinutes.push(confirmMinutes);
      }
    }

    if (
      purchase.returnedBy &&
      ["Admin", "SubAdmin", "Moderator"].includes(purchase.returnedBy.role)
    ) {
      const returnerId = purchase.returnedBy._id.toString();

      if (!staffStats[returnerId]) {
        staffStats[returnerId] = {
          staff: {
            id: purchase.returnedBy._id,
            name: purchase.returnedBy.name,
            email: purchase.returnedBy.email,
            role: purchase.returnedBy.role,
          },
          totalReceivedOrders: 0,
          totalConfirmedOrders: 0,
          totalConfirmedItems: 0,
          totalReturnedOrders: 0,
          totalReturnedItems: 0,
          responseTimesMinutes: [],
          confirmationTimesMinutes: [],
        };
      }

      staffStats[returnerId].totalReturnedOrders++;
      staffStats[returnerId].totalReturnedItems += purchase.items?.length || 0;
    }
  });

  const staffReportArray = Object.values(staffStats)
    .map((stat) => {
      const avgResponseMinutes =
        stat.responseTimesMinutes.length > 0
          ? stat.responseTimesMinutes.reduce((a, b) => a + b, 0) /
            stat.responseTimesMinutes.length
          : 0;

      const avgConfirmationMinutes =
        stat.confirmationTimesMinutes.length > 0
          ? stat.confirmationTimesMinutes.reduce((a, b) => a + b, 0) /
            stat.confirmationTimesMinutes.length
          : 0;

      return {
        staff: stat.staff,
        totalReceivedOrders: stat.totalReceivedOrders,
        totalConfirmedOrders: stat.totalConfirmedOrders,
        totalConfirmedItems: stat.totalConfirmedItems,
        totalReturnedOrders: stat.totalReturnedOrders,
        totalReturnedItems: stat.totalReturnedItems,
        averageResponseTime: formatMinutes(avgResponseMinutes),
        averageConfirmationTime: formatMinutes(avgConfirmationMinutes),
      };
    })
    .sort(
      (a, b) =>
        b.totalReceivedOrders +
        b.totalConfirmedOrders +
        b.totalReturnedOrders -
        (a.totalReceivedOrders +
          a.totalConfirmedOrders +
          a.totalReturnedOrders),
    );

  const platformTotals = {
    totalReceivedOrders: staffReportArray.reduce(
      (sum, staff) => sum + staff.totalReceivedOrders,
      0,
    ),
    totalConfirmedOrders: staffReportArray.reduce(
      (sum, staff) => sum + staff.totalConfirmedOrders,
      0,
    ),
    totalConfirmedItems: staffReportArray.reduce(
      (sum, staff) => sum + staff.totalConfirmedItems,
      0,
    ),
    totalReturnedOrders: staffReportArray.reduce(
      (sum, staff) => sum + staff.totalReturnedOrders,
      0,
    ),
    totalReturnedItems: staffReportArray.reduce(
      (sum, staff) => sum + staff.totalReturnedItems,
      0,
    ),
    totalStaff: staffReportArray.length,
  };

  res.status(200).json({
    status: "success",
    data: {
      platformSummary: platformTotals,
      staffReport: staffReportArray,
    },
  });
});
