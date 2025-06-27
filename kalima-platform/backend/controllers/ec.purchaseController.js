const ECPurchase = require("../models/ec.purchaseModel");
const ECCoupon = require("../models/ec.couponModel");
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
    { path: "couponCode", select: "couponCode value expirationDate" },
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
    { path: "couponCode", select: "couponCode value expirationDate" },

    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
  // Handle payment screenshot upload
  let paymentScreenShotPath = null;
  if (req.file && req.file.fieldname === "paymentScreenShot") {
    paymentScreenShotPath = req.file.path;
    req.body.paymentScreenShot = paymentScreenShotPath;
  } else if (!req.body.paymentScreenShot) {
    // If not uploaded, set to null (model will error if required)
    req.body.paymentScreenShot = null;
  }
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
  let coupon;
  if (req.body.couponCode) {
    coupon = await ECCoupon.findOne({
      couponCode: req.body.couponCode.toString(),
    });
    if (!coupon) {
      return next(new AppError("Invalid or expired coupon code", 400));
    }
    // Check if the coupon is already used
    if (coupon.isActive === false) {
      return next(new AppError("Coupon code has already been used", 400));
    }
  }
  // Set the creator
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;
  req.body.productName = product.title;
  req.body.price = product.priceAfterDiscount;
  req.body.paymentNumber = product.paymentNumber;
  req.body.finalPrice = req.body.price * 1 - (coupon ? coupon.value * 1 : 0);

  // Set coupon ID instead of coupon code string
  if (coupon) {
    console.log("Coupon found:", coupon);
    req.body.couponCode = coupon._id;
  } else {
    delete req.body.couponCode; // Remove couponCode if no coupon is used
  }

  if (!req.user.userSerial) {
    return next(
      new AppError("User serial is required to create a purchase", 400)
    );
  }
  if (!product.section.number) {
    return next(new AppError("Product section number is required", 400));
  }
  if (!product.serial) {
    return next(new AppError("Product serial is required", 400));
  }

  req.body.purchaseSerial = `${req.user.userSerial}-${product.section.number}-${product.serial}`;
  const purchase = await ECPurchase.create(req.body); // Populate the created purchase
  if (!purchase) {
    return next(new AppError("Purchase creation failed", 400));
  }
  if (purchase && coupon) {
    // Mark the coupon as used
    await coupon.markAsUsed(purchase._id, req.user._id);
  }

  // --- Referral successful invite logic ---
  // Only increment inviter's successfulInvites if this is the first purchase for the referred user
  if (req.user.referredBy) {
    const purchaseCount = await ECPurchase.countDocuments({ createdBy: req.user._id });
    if (purchaseCount === 1) {
      // Find the inviter's role (Student, Parent, Teacher)
      const User = require("../models/userModel");
      const Student = require("../models/studentModel");
      const Parent = require("../models/parentModel");
      const Teacher = require("../models/teacherModel");
      const inviter = await User.findById(req.user.referredBy);
      if (inviter) {
        let Model;
        switch (inviter.role) {
          case "Student":
            Model = Student;
            break;
          case "Parent":
            Model = Parent;
            break;
          case "Teacher":
            Model = Teacher;
            break;
          default:
            Model = null;
        }
        if (Model) {
          await Model.findByIdAndUpdate(inviter._id, { $inc: { successfulInvites: 1 } });
        }
      }
    }
  }
  // --- End referral logic ---

  res.status(201).json({
    status: "success",
    data: {
      purchase,
      coupon: coupon ? coupon._id : null, // Return coupon ID if used
    },
  });
});

// Update purchase
exports.updatePurchase = catchAsync(async (req, res, next) => {
  // Handle payment screenshot update
  if (req.file && req.file.fieldname === "paymentScreenShot") {
    req.body.paymentScreenShot = req.file.path;
  } else if (typeof req.body.paymentScreenShot === "undefined") {
    req.body.paymentScreenShot = null;
  }
  // Remove fields that shouldn't be updated directly
  delete req.body.createdBy;
  delete req.body.createdAt;
  delete req.body.purchaseSerial; // Prevent manual serial modification
  delete req.body.finalPrice;
  delete req.body.couponCode;

  const purchase = await ECPurchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
  if (["Parent", "Student", "Teacher"].includes(req.user.role)) {
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
    { path: "couponCode", select: "couponCode value expirationDate" },
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
    { path: "couponCode", select: "couponCode value expirationDate" },
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
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
