const Purchase = require("../models/purchaseModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createPurchase = catchAsync(async (req, res, next) => {
  const { studentId, containerId } = req.body;

  // Prevent duplicate purchases.
  const existing = await Purchase.findOne({
    student: studentId,
    container: containerId,
  });
  if (existing) {
    return next(new AppError("Container already purchased", 400));
  }

  const purchase = await Purchase.create({
    student: studentId,
    container: containerId,
  });
  res.status(201).json(purchase);
});

exports.getPurchasesByStudent = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const purchases = await Purchase.find({ student: studentId }).populate(
    "container"
  );
  res.json(purchases);
});

/**
 * Get all purchases.
 */
exports.getAllPurchases = catchAsync(async (req, res, next) => {
  const purchases = await Purchase.find().populate("container");
  res.json(purchases);
});

/**
 * Get a single purchase by ID.
 */
exports.getPurchaseById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const purchase = await Purchase.findById(id).populate("container");
  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }
  res.json(purchase);
});

/**
 * Update a purchase by ID.
 * Allows adding more children to the same parent.
 */
exports.updatePurchase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { studentId, containerId } = req.body;

  const purchase = await Purchase.findById(id);
  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  // Update the purchase with new children while keeping the parent reference.
  purchase.student = studentId || purchase.student;
  purchase.container = containerId || purchase.container;

  await purchase.save();
  res.json(purchase);
});

/**
 * Delete a purchase by ID.
 */
exports.deletePurchase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const purchase = await Purchase.findByIdAndDelete(id);
  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }
  res.json({ message: "Purchase deleted successfully" });
});