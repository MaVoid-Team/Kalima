const Lesson = require("../models/lessonModel");
const Attendance = require("../models/attendanceModel");
const PricingRule = require("../models/pricingRuleModel"); // Import PricingRule
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");
const mongoose = require("mongoose");

// Get all lessons with filtering, sorting, pagination
exports.getAllLessons = catchAsync(async (req, res, next) => {
  const features = new QueryFeatures(Lesson.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const lessons = await features.query.populate([
    { path: "center", select: "name location" },
    { path: "lecturer", select: "name" },
    { path: "level", select: "name" },
    { path: "subject", select: "name" },
  ]);

  // Optional: Fetch and attach applicable pricing rule for display
  // This adds overhead, consider if needed on the list view
  // const lessonsWithPricing = await Promise.all(lessons.map(async (lesson) => {
  //   const pricingRule = await PricingRule.findOne({
  //       lecturer: lesson.lecturer._id,
  //       subject: lesson.subject._id,
  //       level: lesson.level._id,
  //       $or: [{ center: lesson.center._id }, { center: null }] // Check center-specific then global
  //   }).sort({ center: -1 }); // Prioritize center-specific rule
  //   return { ...lesson.toObject(), applicablePricing: pricingRule };
  // }));


  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: {
      lessons, // Use lessons or lessonsWithPricing if implemented
    },
  });
});

// Get a single lesson by ID
exports.getLessonById = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate([
    { path: "center", select: "name location" },
    { path: "lecturer", select: "name" },
    { path: "level", select: "name" },
    { path: "subject", select: "name" },
  ]);

  if (!lesson) {
    return next(new AppError("No lesson found with that ID", 404));
  }

  // Optional: Fetch and attach applicable pricing rule for display
  // const pricingRule = await PricingRule.findOne({
  //     lecturer: lesson.lecturer._id,
  //     subject: lesson.subject._id,
  //     level: lesson.level._id,
  //     $or: [{ center: lesson.center._id }, { center: null }]
  // }).sort({ center: -1 });
  // const lessonData = { ...lesson.toObject(), applicablePricing: pricingRule };


  res.status(200).json({
    status: "success",
    data: {
      lesson, // Use lesson or lessonData if implemented
    },
  });
});

// Update a lesson by ID
exports.updateLesson = catchAsync(async (req, res, next) => {
  // Exclude fields that shouldn't be updated directly here (like center, lecturer, subject, level)
  // Pricing fields are also removed as they are not stored here anymore.
  const { center, lecturer, subject, level, ...updateData } = req.body;

  // Only allow updating fields like startTime, duration
  const allowedUpdates = {
      startTime: updateData.startTime,
      duration: updateData.duration
  };
  // Filter out undefined values to avoid overwriting with null
  Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);


  if (Object.keys(allowedUpdates).length === 0) {
      return next(new AppError("No valid fields provided for update.", 400));
  }


  const lesson = await Lesson.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    return next(new AppError("No lesson found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      lesson,
    },
  });
});

// Delete a lesson by ID
exports.deleteLesson = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id, { session });

    if (!lesson) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("No lesson found with that ID", 404));
    }

    // Optional: Delete related attendance records if needed (use with caution)
    // await Attendance.deleteMany({ lesson: req.params.id }, { session });

    await session.commitTransaction();
    session.endSession();
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
