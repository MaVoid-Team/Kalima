const ECBookPurchase = require("../models/ec.bookpurchaseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");
const ECProduct = require("../models/ec.productModel");
const mongoose = require("mongoose");

// Get all book purchases
exports.getAllBookPurchases = catchAsync(async (req, res, next) => {
  let query = ECBookPurchase.find();

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ECBookPurchase.countDocuments(
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

// Get book purchase by ID
exports.getBookPurchaseById = catchAsync(async (req, res, next) => {
  const purchase = await ECBookPurchase.findById(req.params.id).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "productId", select: "title serial price section thumbnail" },
  ]);

  if (!purchase) {
    return next(new AppError("No book purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Create new book purchase
exports.createBookPurchase = catchAsync(async (req, res, next) => {
  // Handle payment screenshot upload
  let paymentScreenshotPath = null;
  if (req.file && req.file.fieldname === "paymentScreenshot") {
    paymentScreenshotPath = req.file.path;
    req.body.paymentScreenshot = paymentScreenshotPath;
  } else if (!req.body.paymentScreenshot) {
    return next(new AppError("Payment screenshot is required", 400));
  }

  const product = await ECProduct.findById(req.body.productId).populate(
    "section",
    "number"
  );

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (product.__t !== "ECBook") {
    return next(new AppError("This endpoint is only for book purchases.", 400));
  }

  if (!req.body.nameOnBook || !req.body.numberOnBook || !req.body.seriesName) {
    return next(
      new AppError("nameOnBook, numberOnBook, and seriesName are required", 400)
    );
  }

  // Set the creator
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;
  req.body.productName = product.title;
  req.body.price = product.priceAfterDiscount;
  req.body.paymentNumber = product.paymentNumber;
  req.body.purchaseSerial = `${req.user.userSerial}-${product.section.number}-${product.serial}`;

  const purchase = await ECBookPurchase.create(req.body);

  if (!purchase) {
    return next(new AppError("Book purchase creation failed", 400));
  }

  res.status(201).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Update book purchase
exports.updateBookPurchase = catchAsync(async (req, res, next) => {
  // Remove fields that shouldn't be updated directly
  delete req.body.createdBy;
  delete req.body.createdAt;
  delete req.body.purchaseSerial; // Prevent manual serial modification

  // Only allow updating these fields
  const updatableFields = [
    "nameOnBook",
    "numberOnBook",
    "seriesName",
    "paymentScreenshot",
    "numberTransferredFrom"
  ];
  const updateData = {};
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  const purchase = await ECBookPurchase.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
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
    return next(new AppError("No book purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Confirm book purchase
exports.confirmBookPurchase = catchAsync(async (req, res, next) => {
  const purchase = await ECBookPurchase.findByIdAndUpdate(
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
    return next(new AppError("No book purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Delete extended EC purchase
exports.deleteBookPurchase = catchAsync(async (req, res, next) => {
  const purchase = await ECBookPurchase.findByIdAndDelete(req.params.id);

  if (!purchase) {
    return next(new AppError("No extended EC purchase found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get extended EC purchase statistics
exports.getBookPurchaseStats = catchAsync(async (req, res, next) => {
  const stats = await ECBookPurchase.aggregate([
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

  const monthlyStats = await ECBookPurchase.aggregate([
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
exports.getBookPurchaseByUser = catchAsync(async (req, res, next) => {
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
  let query = ECBookPurchase.find({ createdBy: req.body.userId });

  // Apply QueryFeatures for filtering, sorting, and pagination
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Get total count for pagination (before applying pagination)
  const totalPurchases = await ECBookPurchase.countDocuments({
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
exports.searchBookPurchaseBySerial = catchAsync(async (req, res, next) => {
  const { serial } = req.params;
  const purchase = await ECBookPurchase.findOne({
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