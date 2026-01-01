const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const PaymentMethod = require("../models/paymentMethodModel");

exports.createPaymentMethod = catchAsync(async (req, res, next) => {
    const { name, phoneNumber, paymentMethodImg } = req.body;

    // Validation
    if (!name || !phoneNumber || (!req.file && !paymentMethodImg)) {
        return next(new AppError("Name, phone number, and payment method image are required", 400));
    }

    // Check if payment method with this name already exists
    const existingMethod = await PaymentMethod.findOne({ name });
    if (existingMethod) {
        return next(new AppError("Payment method with this name already exists", 400));
    }

    const paymentMethod = await PaymentMethod.create({
        name,
        phoneNumber,
        paymentMethodImg: req.file ? req.file.path : paymentMethodImg,
    });

    res.status(201).json({
        status: "success",
        message: "Payment method created successfully",
        data: {
            paymentMethod,
        },
    });
});

exports.getAllPaymentMethods = catchAsync(async (req, res, next) => {
    const paymentMethods = await PaymentMethod.find().select("-__v");

    res.status(200).json({
        status: "success",
        results: paymentMethods.length,
        data: {
            paymentMethods,
        },
    });
});

exports.getPaymentMethodById = catchAsync(async (req, res, next) => {
    const paymentMethod = await PaymentMethod.findById(req.params.id).select("-__v");

    if (!paymentMethod) {
        return next(new AppError("Payment method not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            paymentMethod,
        },
    });
});

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
    const { name, phoneNumber, paymentMethodImg } = req.body;

    // Check if updating name and if it's already taken by another method
    if (name) {
        const existingMethod = await PaymentMethod.findOne({ name, _id: { $ne: req.params.id } });
        if (existingMethod) {
            return next(new AppError("Payment method with this name already exists", 400));
        }
    }

    const updateData = { name, phoneNumber };

    // Add image to update if a new file is uploaded
    if (req.file) {
        updateData.paymentMethodImg = req.file.path;
    } else if (paymentMethodImg) {
        updateData.paymentMethodImg = paymentMethodImg;
    }

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!paymentMethod) {
        return next(new AppError("Payment method not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Payment method updated successfully",
        data: {
            paymentMethod,
        },
    });
});

exports.changePaymentMethodStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    // Validation
    if (status === undefined || status === null) {
        return next(new AppError("Status is required", 400));
    }

    if (typeof status !== "boolean") {
        return next(new AppError("Status must be a boolean value (true/false)", 400));
    }

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
        req.params.id,
        { status },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!paymentMethod) {
        return next(new AppError("Payment method not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: `Payment method status changed to ${status ? "active" : "inactive"} successfully`,
        data: {
            paymentMethod,
        },
    });
});

exports.deletePaymentMethod = catchAsync(async (req, res, next) => {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);

    if (!paymentMethod) {
        return next(new AppError("Payment method not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Payment method deleted successfully",
    });
});
