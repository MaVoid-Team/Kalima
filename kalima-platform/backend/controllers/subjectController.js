const Subject = require("../models/subjectModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Level = require("../models/levelModel");
// Create a new subject
exports.createSubject = catchAsync(async (req, res, next) => {
  const subject = Subject.create(req.body);
  if (!subject) {
    return next(new AppError("Subject could not be created", 400));
  }
  res.status(201).send(subject);
});

// Get all subjects
exports.getAllSubjects = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find();
  if (subjects.length === 0) {
    return next(new AppError("No subjects found", 404));
  }
  res.status(200).send(subjects);
});

// Get a subject by ID
exports.getSubjectById = catchAsync(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    return next(new AppError("No subject found with that ID", 404));
  }
  res.status(200).send(subject);
});

// Update a subject by ID
exports.updateSubjectById = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(new AppError("Name is required", 400));
  }
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { name },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!subject) {
    return next(new AppError("No subject found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      subject,
    },
  });
});

exports.updateLevelOfSubject = catchAsync(async (req, res, next) => {
  const { operation, levelId } = req.body;
  if (!operation || !levelId) {
    return next(new AppError("Operation and level ID are required", 400));
  }
  const level = await Level.findById(levelId);
  if (!level) {
    return next(new AppError("No level found with that ID", 404));
  }
  let subject;
  if (operation === "add") {
    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { level: { $push: levelId } },
      {
        new: true,
        runValidators: true,
      }
    );
  } else if (operation === "remove") {
    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { level: { $pull: levelId } },
      {
        new: true,
        runValidators: true,
      }
    );
  } else {
    return next(new AppError("Invalid operation", 400));
  }
  if (!subject) {
    return next(new AppError("No subject found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      subject,
    },
  });
});

// Delete a subject by ID
exports.deleteSubjectById = catchAsync(async (req, res, next) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    return next(new AppError("No subject found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
