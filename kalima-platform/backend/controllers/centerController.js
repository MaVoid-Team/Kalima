const Center = require("../models/centerModel");
const Lesson = require("../models/lessonModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new center
exports.createCenter = catchAsync(async (req, res, next) => {
  const { name, location } = req.body;
  const center = await Center.create({ name, location });
  res.status(201).json({
    status: "success",
    data: { center },
  });
});

// Get all centers
exports.getAllCenters = catchAsync(async (req, res, next) => {
  const centers = await Center.find();
  res.status(200).json({
    status: "success",
    results: centers.length,
    data: { centers },
  });
});

// Add a lesson to a center
exports.addLesson = catchAsync(async (req, res, next) => {
  const { subject, lecturer, startTime, duration, centerId } = req.body;

  // Ensure the lecturer field is provided
  if (!lecturer) {
    return next(new AppError("Lecturer is required.", 400));
  }

  const lesson = await Lesson.create({ subject, lecturer, startTime, duration, center: centerId });

  res.status(201).json({
    status: "success",
    data: { lesson },
  });
});

// Get timetable for a center
exports.getTimetable = catchAsync(async (req, res, next) => {
  const { centerId } = req.params;

  const center = await Center.findById(centerId);
  if (!center) return next(new AppError("Center not found", 404));

  const lessons = await Lesson.find({ center: centerId }).populate("lecturer", "name");

  const timetable = lessons.map((lesson) => ({
    subject: lesson.subject,
    lecturer: lesson.lecturer.name,
    startTime: lesson.startTime,
    endTime: new Date(new Date(lesson.startTime).getTime() + lesson.duration * 60000),
    lessonId: lesson._id,
  }));

  res.status(200).json({
    status: "success",
    data: { timetable },
  });
});

// Delete a lesson from a center
exports.deleteLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) return next(new AppError("Lesson not found", 404));

  res.status(200).json({
    status: "success",
    message: "Lesson deleted successfully",
  });
});