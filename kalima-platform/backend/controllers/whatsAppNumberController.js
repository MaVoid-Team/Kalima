// DOMAIN: UNKNOWN
// STATUS: LEGACY
// NOTE: WhatsApp number logic with unclear domain ownership.
const WhatsAppNumber = require("../models/whatsAppNumberModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new WhatsApp number
exports.createWhatsAppNumber = catchAsync(async (req, res, next) => {
  const { number } = req.body;
  const existingNumber = await WhatsAppNumber.findOne({ number });
  if (existingNumber) {
    return next(new AppError("This WhatsApp number already exists.", 400));
  }
  const whatsAppNumber = await WhatsAppNumber.create({ number });
  res.status(201).json({
    status: "success",
    message: "whatsApp number created successfully",
    data: {
      whatsAppNumber,
    },
  });
});

// Get all WhatsApp numbers
exports.getAllWhatsAppNumbers = catchAsync(async (req, res, next) => {
  const whatsAppNumbers = await WhatsAppNumber.find({ number: { $ne: null } });
  res.status(200).json({
    status: "success",
    data: {
      whatsAppNumbers,
    },
  });
});

// Get a WhatsApp number by ID
exports.getWhatsAppNumberById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const whatsAppNumber = await WhatsAppNumber.findById(id);
  if (!whatsAppNumber) {
    return next(new AppError("WhatsApp number not found.", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      whatsAppNumber,
    },
  });
});

// deactivate a WhatsApp number
exports.switchWhatsAppNumberStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const whatsAppNumber = await WhatsAppNumber.findById(id);
  if (!whatsAppNumber) {
    return next(new AppError("WhatsApp number not found.", 404));
  }
  whatsAppNumber.isActive = !whatsAppNumber.isActive;
  await whatsAppNumber.save();
  res.status(200).json({
    status: "success",
    message: `WhatsApp number has been ${whatsAppNumber.isActive ? "activated" : "deactivated"} successfully.`,
    data: {
      whatsAppNumber,
    },
  });
});

// Update a WhatsApp Number
exports.updateWhatsAppNumber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { number } = req.body;
  const whatsAppNumber = await WhatsAppNumber.findByIdAndUpdate(
    id,
    { number },
    { new: true },
  );

  if (!whatsAppNumber) {
    return next(new AppError("WhatsApp number not found.", 404));
  }

  res.status(200).json({
    status: "success",
    message: "WhatsApp number updated successfully.",
    data: {
      whatsAppNumber,
    },
  });
});

// Delete a WhatsApp Number
exports.deleteWhatsAppNumber = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const whatsAppNumber = await WhatsAppNumber.findByIdAndDelete(id);
  if (!whatsAppNumber) {
    return next(new AppError("WhatsApp number not found.", 404));
  }
  res.status(200).json({
    status: "success",
    message: "WhatsApp number deleted successfully.",
    data: null,
  });
});
