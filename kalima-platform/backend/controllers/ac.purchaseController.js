const ExtendedECPurchase = require("../models/ac.purchaseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");
const ECProduct = require("../models/ec.productModel");
const mongoose = require("mongoose");

// Get all extended EC purchases
exports.getAllExtendedECPurchases = catchAsync(async (req, res, next) => {
  let query = ExtendedECPurchase.find();

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ExtendedECPurchase.countDocuments(
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

// Get extended EC purchase by ID
exports.getExtendedECPurchaseById = catchAsync(async (req, res, next) => {
  const purchase = await ExtendedECPurchase.findById(req.params.id).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No extended EC purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Create new extended EC purchase
exports.createExtendedECPurchase = catchAsync(async (req, res, next) => {
  const product = await ECProduct.findById(req.body.productId).populate(
    "section",
    "number"
  );
      console.log(req.body.productId);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (req.body.confirmedBy) {
    return next(new AppError("Extended EC purchase cannot be confirmed at creation", 400));
  }

  // Validate required extended fields
  if (!req.body.NameOnBook || !req.body.NumberOnBook || !req.body.SName) {
    return next(new AppError("NameOnBook, NumberOnBook, and Snumber are required", 400));
  }

  // Set the creator
  console.log("Creating extended EC purchase with user:", req.user._id);
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;
  req.body.productName = product.title;
  req.body.price = product.price;
  req.body.purchaseSerial = `${req.user.sequencedId}-${product.section.number}-${product.serial}`;
  
  const purchase = await ExtendedECPurchase.create(req.body);
  
  if (!purchase) {
    return next(new AppError("Extended EC purchase creation failed", 400));
  }

  res.status(201).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Update extended EC purchase
exports.updateExtendedECPurchase = catchAsync(async (req, res, next) => {
  // Remove fields that shouldn't be updated directly
  delete req.body.createdBy;
  delete req.body.createdAt;
  delete req.body.purchaseSerial; // Prevent manual serial modification

  const purchase = await ExtendedECPurchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No extended EC purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Confirm extended EC purchase
exports.confirmExtendedECPurchase = catchAsync(async (req, res, next) => {
  const purchase = await ExtendedECPurchase.findByIdAndUpdate(
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
    return next(new AppError("No extended EC purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Delete extended EC purchase
exports.deleteExtendedECPurchase = catchAsync(async (req, res, next) => {
  const purchase = await ExtendedECPurchase.findByIdAndDelete(req.params.id);

  if (!purchase) {
    return next(new AppError("No extended EC purchase found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get extended EC purchase statistics
exports.getExtendedECPurchaseStats = catchAsync(async (req, res, next) => {
  const stats = await ExtendedECPurchase.aggregate([
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

  const monthlyStats = await ExtendedECPurchase.aggregate([
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

// Get extended EC purchases by user
exports.getExtendedECPurchasesByUser = catchAsync(async (req, res, next) => {
  if (req.user.role === "Parent" || "Student" || "Teacher") {
    req.body.userId = req.user._id;
  } else {
    if (req.params.userId) {
      req.body.userId = req.params.userId;
    }
  }
  
  if (!req.body.userId) {
    return next(new AppError("User ID is required to get extended EC purchases", 400));
  }

  // Build base query with userId filter
  let query = ExtendedECPurchase.find({ createdBy: req.body.userId });

  // Apply QueryFeatures for filtering, sorting, and pagination
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ExtendedECPurchase.countDocuments({
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

// Search extended EC purchases by serial
exports.searchExtendedECBySerial = catchAsync(async (req, res, next) => {
  const { serial } = req.params;
  const purchase = await ExtendedECPurchase.findOne({
    purchaseSerial: serial,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No extended EC purchase found with that serial number", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});