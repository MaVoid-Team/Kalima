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

// Get assistants by assigned lecturer
exports.getAssistantsByLecturer = catchAsync(async (req, res, next) => {
    const { lecturerId } = req.params;

    if (!lecturerId) {
        return next(new AppError("Lecturer ID is required.", 400));
    }

    const assistants = await Assistant.find({ assignedLecturer: lecturerId })
        .populate("assignedLecturer", "name email")
        .select("-password");

    if (!assistants || assistants.length === 0) {
        return next(new AppError("No assistants found for this lecturer.", 404));
    }

    res.status(200).json({
        status: "success",
        results: assistants.length,
        data: {
            assistants
        }
    });
});