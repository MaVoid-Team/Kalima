const Lecturer = require("../models/lecturerModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");

// Create a new lecturer
exports.createLecturer = catchAsync(async (req, res, next) => {
    const { name, email, password, gender, role, bio, expertise } = req.body;

    if (!bio || !expertise) {
        return next(new AppError("Bio and expertise are required.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const lecturer = await Lecturer.create({
        name,
        email,
        password: hashedPassword,
        gender,
        role,
        bio,
        expertise,
    });

    res.status(201).json({
        status: "success",
        data: lecturer,
    });
});

// Get all lecturers
exports.getAllLecturers = catchAsync(async (req, res, next) => {
    const lecturers = await Lecturer.find();

    res.status(200).json({
        status: "success",
        data: lecturers,
    });
});

// Get a lecturer by ID
exports.getLecturerById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const lecturer = await Lecturer.findById(id);

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: lecturer,
    });
});

// Update a lecturer by ID
exports.updateLecturer = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, bio, expertise } = req.body;

    const lecturer = await Lecturer.findByIdAndUpdate(
        id,
        { name, email, bio, expertise },
        { new: true, runValidators: true }
    );

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: lecturer,
    });
});

// Delete a lecturer by ID
exports.deleteLecturer = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const lecturer = await Lecturer.findByIdAndDelete(id);

    if (!lecturer) {
        return next(new AppError("Lecturer not found.", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Lecturer deleted successfully.",
    });
});