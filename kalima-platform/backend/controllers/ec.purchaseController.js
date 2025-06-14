const ECPurchase = require("../models/ec.purchaseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");
const ECProduct = require("../models/ec.productModel");
const mongoose = require("mongoose");

// Get all purchases
exports.getAllPurchases = catchAsync(async (req, res, next) => {
  let query = ECPurchase.find();

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ECPurchase.countDocuments(
    features.query.getFilter()
  );

  // Apply population and execute query
  const purchases = await features.query.populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  // Calculate pagination info
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  res.status(200).json({
    status: "success",
    results: purchases.length,
    totalPurchases,
    totalPages: Math.ceil(totalPurchases / limit),
    currentPage: page,
    data: {
      purchases,
    },
  });
});

// Get purchase by ID
exports.getPurchaseById = catchAsync(async (req, res, next) => {
  const purchase = await ECPurchase.findById(req.params.id).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Create new purchase
exports.createPurchase = catchAsync(async (req, res, next) => {
  const product = await ECProduct.findById(req.body.productId).populate(
    "section",
    "number"
  );
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (req.body.confirmedBy) {
    return next(new AppError("Purchase cannot be confirmed at creation", 400));
  }
  // Set the creator
  console.log("Creating purchase with user:", req.user._id);
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;
  req.body.productName = product.title; // Use product title as name
  req.body.price = product.price;
  req.body.purchaseSerial = `${req.user.sequencedId}-${product.section.number}-${product.serial}`;
  const purchase = await ECPurchase.create(req.body); // Populate the created purchase
  if (!purchase) {
    return next(new AppError("Purchase creation failed", 400));
  }

  res.status(201).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Update purchase
exports.updatePurchase = catchAsync(async (req, res, next) => {
  // Remove fields that shouldn't be updated directly
  delete req.body.createdBy;
  delete req.body.createdAt;
  delete req.body.purchaseSerial; // Prevent manual serial modification

  const purchase = await ECPurchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Confirm purchase
exports.confirmPurchase = catchAsync(async (req, res, next) => {
  const purchase = await ECPurchase.findByIdAndUpdate(
    req.params.id,
    {
      confirmed: true,
      confirmedBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Delete purchase
exports.deletePurchase = catchAsync(async (req, res, next) => {
  const purchase = await ECPurchase.findByIdAndDelete(req.params.id);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get purchase statistics
exports.getPurchaseStats = catchAsync(async (req, res, next) => {
  const stats = await ECPurchase.aggregate([
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        confirmedPurchases: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, 1, 0] },
        },
        pendingPurchases: {
          $sum: { $cond: [{ $eq: ["$confirmed", false] }, 1, 0] },
        },
        totalRevenue: { $sum: "$price" },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, "$price", 0] },
        },
        averagePrice: { $avg: "$price" },
      },
    },
  ]);

  const monthlyStats = await ECPurchase.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$price" },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, 1, 0] },
        },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, "$price", 0] },
        },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      overview: stats[0] || {
        totalPurchases: 0,
        confirmedPurchases: 0,
        pendingPurchases: 0,
        totalRevenue: 0,
        confirmedRevenue: 0,
        averagePrice: 0,
      },
      monthlyStats,
    },
  });
});

// Get purchases by user
exports.getPurchasesByUser = catchAsync(async (req, res, next) => {
  if (req.user.role === "Parent" || "Student" || "Teacher") {
    req.body.userId = req.user._id;
  } else {
    if (req.params.userId) {
      req.body.userId = req.params.userId;
    }
  }
  if (!req.body.userId) {
    return next(new AppError("User ID is required to get purchases", 400));
  }
  // Build base query with userName filter
  let query = ECPurchase.find({ createdBy: req.body.userId });

  // Apply QueryFeatures for filtering, sorting, and pagination
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ECPurchase.countDocuments({
    createdBy: req.body.userId,
    ...features.query.getFilter(),
  });

  // Apply population and execute query
  const purchases = await features.query.populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  // Calculate pagination info
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  res.status(200).json({
    status: "success",
    results: purchases.length,
    totalPurchases,
    totalPages: Math.ceil(totalPurchases / limit),
    currentPage: page,
    data: {
      purchases,
    },
  });
});

// Search purchases by serial
exports.searchBySerial = catchAsync(async (req, res, next) => {
  const { serial } = req.params;
  const purchase = await ECPurchase.findOne({
    purchaseSerial: serial,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No purchase found with that serial number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});
