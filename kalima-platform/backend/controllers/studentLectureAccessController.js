const mongoose = require("mongoose");
const StudentLectureAccess = require("../models/studentLectureAccessModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createStudentLectureAccess = catchAsync(async (req, res, next) => {
  const access = await StudentLectureAccess.create(req.body);
  res.status(201).json({
    status: "success",
    data: access,
  });
});

exports.getStudentLectureAccess = catchAsync(async (req, res, next) => {
  const access = await StudentLectureAccess.findById(req.params.id).populate([
    { path: "student", select: "name" },
    { path: "lecture", select: "name videoLink" },
  ]);
  if (!access) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: access,
  });
});

exports.getAllStudentLectureAccess = catchAsync(async (req, res, next) => {
  const accesses = await StudentLectureAccess.find().populate([
    { path: "student", select: "name" },
    { path: "lecture", select: "name videoLink" },
  ]);
  res.status(200).json({
    status: "success",
    results: accesses.length,
    data: accesses,
  });
});

exports.updateStudentLectureAccess = catchAsync(async (req, res, next) => {
  const access = await StudentLectureAccess.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!access) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: access,
  });
});

exports.deleteStudentLectureAccess = catchAsync(async (req, res, next) => {
  const access = await StudentLectureAccess.findByIdAndDelete(req.params.id);
  if (!access) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
