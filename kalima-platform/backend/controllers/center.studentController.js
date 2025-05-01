const cStudent = require("../models/center.studentModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const QueryFeatures = require("../utils/queryFeatures");

// Create a new student
exports.createStudent = catchAsync(async (req, res, next) => {
  const { name, phone, gender, parentPhoneNumber, center } = req.body;
  const newStudent = await cStudent.create({
    name,
    phone,
    gender,
    parentPhoneNumber,
    center
  });
  if (!newStudent) {
    return next(new AppError("Failed to create student", 400));
  }
  res.status(201).json({
    status: "success",
    data: {
      newStudent,
    },
  });
});

// Get all students
exports.getAllStudents = catchAsync(async (req, res, next) => {
  const features = new QueryFeatures(cStudent.find(), req.query)
    .filter()
    .sort()
    .paginate();

  const students = await features.query;

  res.status(200).json({
    status: "success",
    results: students.length,
    data: {
      students,
    },
  });
});

// Get a student by ID
exports.getStudentById = catchAsync(async (req, res, next) => {
  const student = await cStudent.findById(req.params.id);
  if (!student) {
    return next(new AppError("Student not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

// Get student by sequenced ID
exports.getStudentBySequencedId = catchAsync(async (req, res, next) => {
  const { sequencedId } = req.params;
  
  if (!sequencedId) {
    return next(new AppError("Sequenced ID is required", 400));
  }
  
  const student = await cStudent.findOne({ sequencedId });
  
  if (!student) {
    return next(new AppError("Student not found", 404));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

// Update a student by ID
exports.updateStudent = catchAsync(async (req, res, next) => {
  const updatedStudent = await cStudent.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedStudent) {
    return next(new AppError("Student not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      updatedStudent,
    },
  });
});

// Delete a student by ID
exports.deleteStudent = catchAsync(async (req, res, next) => {
  const deletedStudent = await cStudent.findByIdAndDelete(req.params.id);
  if (!deletedStudent) {
    return next(new AppError("Student not found", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Student deleted successfully",
    data: null,
  });
});
