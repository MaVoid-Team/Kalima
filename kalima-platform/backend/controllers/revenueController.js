const mongoose = require("mongoose");
const Attendance = require("../models/attendanceModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const buildRevenueMatchStage = (query) => {
  const matchStage = {};
  const {
    lecturerId,
    subjectId,
    levelId,
    centerId,
    lessonId,
    startDate,
    endDate,
  } = query;

  if (lecturerId) matchStage.lecturer = new mongoose.Types.ObjectId(lecturerId);
  if (subjectId) matchStage.subject = new mongoose.Types.ObjectId(subjectId);
  if (levelId) matchStage.level = new mongoose.Types.ObjectId(levelId);
  if (centerId) matchStage.center = new mongoose.Types.ObjectId(centerId);
  if (lessonId) matchStage.lesson = new mongoose.Types.ObjectId(lessonId);

  if (startDate || endDate) {
    matchStage.attendanceDate = {};
    if (startDate) matchStage.attendanceDate.$gte = new Date(startDate);
    if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999); // Include the whole end day
        matchStage.attendanceDate.$lte = endOfDay;
    }
  }

  // Ensure we only sum actual payments
  matchStage.amountPaid = { $gt: 0 };

  return matchStage;
};

exports.calculateRevenue = catchAsync(async (req, res, next) => {
  const matchStage = buildRevenueMatchStage(req.query);

  const revenueResult = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null, // Group all matched documents together
        totalRevenue: { $sum: "$amountPaid" },
        totalAttendancesPaid: { $sum: 1 } // Count attendances where payment occurred
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        totalRevenue: 1,
        totalAttendancesPaid: 1
      }
    }
  ]);

  const result = revenueResult[0] || { totalRevenue: 0, totalAttendancesPaid: 0 }; // Default if no results

  res.status(200).json({
    status: "success",
    data: result,
  });
});

exports.calculateRevenueBreakdown = catchAsync(async (req, res, next) => {
  const matchStage = buildRevenueMatchStage(req.query);

  const revenueResult = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentType", // Group by payment type
        totalRevenue: { $sum: "$amountPaid" },
        count: { $sum: 1 } // Count attendances for this payment type where payment occurred
      },
    },
    {
      $project: {
        _id: 0, // Exclude the default _id field
        paymentType: "$_id",
        totalRevenue: 1,
        count: 1
      }
    },
    { $sort: { paymentType: 1 } } // Optional: sort by payment type
  ]);

   // Calculate overall total
   const overallTotal = revenueResult.reduce((sum, item) => sum + item.totalRevenue, 0);
   const overallCount = revenueResult.reduce((sum, item) => sum + item.count, 0);


  res.status(200).json({
    status: "success",
    data: {
        breakdown: revenueResult,
        overallTotalRevenue: overallTotal,
        overallAttendancesPaid: overallCount
    },
  });
});
