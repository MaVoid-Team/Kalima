const mongoose = require("mongoose");
const Lesson = require("../models/lessonModel");
const Subject = require("../models/subjectModel");
const CLecturer = require("../models/center.lecturerModel");
const Level = require("../models/levelModel");
const Center = require("../models/centerModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const QueryFeatures = require("../utils/queryFeatures");

// Helper function to validate related document IDs
const validateRelatedDocs = async (
  subjectId,
  lecturerId,
  levelId,
  centerId
) => {
  const [subject, lecturer, level, center] = await Promise.all([
    Subject.findById(subjectId),
    CLecturer.findById(lecturerId),
    Level.findById(levelId),
    Center.findById(centerId),
  ]);

  if (!subject) throw new AppError("Subject not found.", 404);
  if (!lecturer) throw new AppError("Lecturer not found.", 404);
  if (!level) throw new AppError("Level not found.", 404);
  if (!center) throw new AppError("Center not found.", 404);

  // Optional: Check if the lecturer belongs to the specified center
  if (lecturer.center.toString() !== centerId) {
    throw new AppError(
      "Lecturer does not belong to the specified center.",
      400
    );
  }
};

// Create a new lesson
exports.createLesson = catchAsync(async (req, res, next) => {
  const { subject, lecturer, level, startTime, duration, center } = req.body;

  if (!subject || !lecturer || !level || !startTime || !center) {
    return next(
      new AppError(
        "Subject, lecturer, level, start time, and center are required.",
        400
      )
    );
  }

  // Validate related documents
  await validateRelatedDocs(subject, lecturer, level, center);

  const newLesson = await Lesson.create({
    subject,
    lecturer,
    level,
    startTime,
    duration, // Optional
    center,
  });

  res.status(201).json({
    status: "success",
    data: {
      lesson: newLesson,
    },
  });
});

// Get all lessons
exports.getAllLessons = catchAsync(async (req, res, next) => {
  const features = new QueryFeatures(Lesson.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const lessons = await features.query
    .populate({ path: "subject", select: "name" }) // Adjust select as needed
    .populate({ path: "lecturer", select: "name" }) // Adjust select as needed
    .populate({ path: "level", select: "name" }) // Adjust select as needed
    .populate({ path: "center", select: "name" }); // Adjust select as needed

  res.status(200).json({
    status: "success",
    results: lessons.length,
    data: {
      lessons,
    },
  });
});

// Get a single lesson by ID
exports.getLessonById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid lesson ID format.", 400));
  }

  const lesson = await Lesson.findById(id)
    .populate({ path: "subject", select: "name" })
    .populate({ path: "lecturer", select: "name" })
    .populate({ path: "level", select: "name" })
    .populate({ path: "center", select: "name" });

  if (!lesson) {
    return next(new AppError("Lesson not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      lesson,
    },
  });
});

// Update a lesson by ID
exports.updateLesson = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { subject, lecturer, level, startTime, duration, center } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid lesson ID format.", 400));
  }

  // Validate related documents if they are being updated
  if (subject || lecturer || level || center) {
    const currentLesson = await Lesson.findById(id);
    if (!currentLesson) {
      return next(new AppError("Lesson not found.", 404));
    }
    // Use existing values if not provided in the request body for validation
    await validateRelatedDocs(
      subject || currentLesson.subject,
      lecturer || currentLesson.lecturer,
      level || currentLesson.level,
      center || currentLesson.center
    );
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate({ path: "subject", select: "name" })
    .populate({ path: "lecturer", select: "name" })
    .populate({ path: "level", select: "name" })
    .populate({ path: "center", select: "name" });

  if (!updatedLesson) {
    return next(new AppError("Lesson not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      lesson: updatedLesson,
    },
  });
});

// Delete a lesson by ID
exports.deleteLesson = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid lesson ID format.", 400));
  }

  const deletedLesson = await Lesson.findByIdAndDelete(id);

  if (!deletedLesson) {
    return next(new AppError("Lesson not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
