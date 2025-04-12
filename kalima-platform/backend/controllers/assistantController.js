const Assistant = require("../models/assistantModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");


exports.createAssistant = catchAsync(async (req, res, next) => {
    const { name, email, password, gender, role, assignedLecturer } = req.body;

    if (!assignedLecturer) {
        return next(new AppError("Assigned lecturer is required.", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const assistant = await Assistant.create({
        name,
        email,
        password: hashedPassword,
        role,
        gender,
        assignedLecturer,
    });

    res.status(201).json({
        status: "success",
        data: assistant,
    });
});

// Get all assistants
exports.getAllAssistants = catchAsync(async (req, res, next) => {
    const assistants = await Assistant.find().populate("assignedLecturer");

    res.status(200).json({
        status: "success",
        data: assistants,
    });
});

// Get an assistant by ID
exports.getAssistantById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const assistant = await Assistant.findById(id).populate("assignedLecturer");

    if (!assistant) {
        return next(new AppError("Assistant not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: assistant,
    });
});

// Update an assistant by ID
exports.updateAssistant = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, assignedLecturer } = req.body;

    const assistant = await Assistant.findByIdAndUpdate(
        id,
        { name, email, assignedLecturer },
        { new: true, runValidators: true }
    );

    if (!assistant) {
        return next(new AppError("Assistant not found.", 404));
    }

    res.status(200).json({
        status: "success",
        data: assistant,
    });
});

// Delete an assistant by ID
exports.deleteAssistant = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const assistant = await Assistant.findByIdAndDelete(id);

    if (!assistant) {
        return next(new AppError("Assistant not found.", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Assistant deleted successfully.",
    });
});