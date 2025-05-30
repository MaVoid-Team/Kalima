const ECSection = require("../models/ec.sectionModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new section
exports.createSection = catchAsync(async (req, res, next) => {
  const section = await ECSection.create(req.body);
  if (!section) {
    return next(new AppError("Section could not be created", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      section,
    },
  });
});

// Get all sections
exports.getAllSections = catchAsync(async (req, res, next) => {
  const sections = await ECSection.find();
  res.status(200).json({
    status: "success",
    results: sections.length,
    data: {
      sections,
    },
  });
});

// Get section by ID
exports.getSectionById = catchAsync(async (req, res, next) => {
  const section = await ECSection.findById(req.params.id);
  if (!section) {
    return next(new AppError("No section found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      section,
    },
  });
});

// Update section
exports.updateSection = catchAsync(async (req, res, next) => {
  const section = await ECSection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!section) {
    return next(new AppError("No section found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      section,
    },
  });
});

// Delete section
exports.deleteSection = catchAsync(async (req, res, next) => {
  const section = await ECSection.findByIdAndDelete(req.params.id);
  if (!section) {
    return next(new AppError("No section found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
