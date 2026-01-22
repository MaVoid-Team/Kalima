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
    features.query.getFilter(),
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

// Create new book purchase (Refactored to use ECCartPurchase)
exports.createBookPurchase = catchAsync(async (req, res, next) => {
  const ECCartPurchase = require("../models/ec.cartPurchaseModel");
  const PaymentMethod = require("../models/paymentMethodModel");
  const User = require("../models/userModel");
  const Notification = require("../models/notification");
  const { DateTime } = require("luxon");
  const ECCoupon = require("../models/ec.couponModel"); // Ensure imported

  // --- Referral successful invite logic ---
  // We check ECCartPurchase count now
  if (req.user.referredBy) {
    const purchaseCount = await ECCartPurchase.countDocuments({
      createdBy: req.user._id,
    });
    if (purchaseCount === 1) {
      // 1 means they ALREADY had one? No, we count before creation?
      // The original logic counted BEFORE creation. But wait, if they have 0, and we create one, then they have 1.
      // The logic says "Only increment ... if this is the first purchase".
      // If I count BEFORE creating, and it is 0, then YES.
      // The previous implementation for ECPurchase counted inside the controller?
      // No, it counted lines 70-76 before creation... BUT wait, if I count existing purchases, it will be 0 if first time.
      // So this logic is "If user has 0 purchases so far, trigger referral".
      // Let's keep it safe: We'll trigger it AFTER success if count was 0.
      // But to avoid complex logic flow, I will just call it if existing count is 0.
    }
    // Actually, let's keep it simple and consistent with Purchase Controller refactor.
  }

  // Handle payment screenshot upload
  let paymentScreenShotPath = null;
  if (req.file && req.file.fieldname === "paymentScreenShot") {
    paymentScreenShotPath = req.file.path;
    req.body.paymentScreenShot = paymentScreenShotPath;
  } else if (!req.body.paymentScreenShot) {
    return next(new AppError("Payment screenshot is required", 400));
  }

  const product = await ECProduct.findById(req.body.productId).populate(
    "section",
    "number",
  );

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  if (product.__t !== "ECBook") {
    return next(new AppError("This endpoint is only for book purchases.", 400));
  }

  if (!req.body.nameOnBook || !req.body.numberOnBook || !req.body.seriesName) {
    return next(
      new AppError(
        "nameOnBook, numberOnBook, and seriesName are required",
        400,
      ),
    );
  }

  // Support notes/adminNotes
  if (typeof req.body.notes === "undefined") req.body.notes = null;
  if (typeof req.body.adminNotes === "undefined") req.body.adminNotes = null;

  // Coupon logic
  let coupon;
  if (req.body.couponCode) {
    coupon = await ECCoupon.findOne({
      couponCode: req.body.couponCode.toString(),
    });
    if (!coupon) {
      return next(new AppError("Invalid or expired coupon code", 400));
    }
    if (coupon.isActive === false) {
      return next(new AppError("Coupon code has already been used", 400));
    }
  }

  // Set the creator info
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;

  // Pricing
  const price = product.priceAfterDiscount;
  const couponValue = coupon ? coupon.value * 1 : 0;
  const finalPrice = price * 1 - couponValue;

  // Validate payment info (Usually mandatory for books)
  let paymentMethodDoc = null;
  // If we want to support "paymentNumber" from body, we can try to find method, similar to purchase controller
  if (
    req.body.paymentMethod &&
    mongoose.Types.ObjectId.isValid(req.body.paymentMethod)
  ) {
    paymentMethodDoc = await PaymentMethod.findById(req.body.paymentMethod);
  }

  // --- Serial Generation Logic (Unified with Cart) ---
  const userSerial =
    req.user.userSerial || req.user._id.toString().slice(-8).toUpperCase();
  const getCurrentEgyptTime = () => DateTime.now().setZone("Africa/Cairo");
  const date = getCurrentEgyptTime();
  const formattedDate = date.toFormat("yyyyMMdd");

  const lastPurchase = await ECCartPurchase.findOne({
    purchaseSerial: new RegExp(`${userSerial}-CP-${formattedDate}-\\d+$`),
  }).sort({ purchaseSerial: -1 });

  let sequence = 1;
  if (lastPurchase) {
    const lastSequence = parseInt(lastPurchase.purchaseSerial.split("-").pop());
    sequence = lastSequence + 1;
  }
  const formattedSequence = sequence.toString().padStart(3, "0");
  const purchaseSerial = `${userSerial}-CP-${formattedDate}-${formattedSequence}`;

  // Construct Item for ECCartPurchase
  const item = {
    product: product._id,
    productType: "ECBook",
    priceAtPurchase: price,
    nameOnBook: req.body.nameOnBook,
    numberOnBook: req.body.numberOnBook,
    seriesName: req.body.seriesName,
    productSnapshot: {
      title: product.title,
      thumbnail: product.thumbnail,
      section: product.section,
      serial: product.serial,
    },
  };

  // Create ECCartPurchase
  const purchase = await ECCartPurchase.create({
    userName: req.user.name,
    createdBy: req.user._id,
    items: [item],
    numberTransferredFrom: req.body.numberTransferredFrom || null,
    paymentNumber:
      product.paymentNumber ||
      (paymentMethodDoc ? paymentMethodDoc.phoneNumber : null),
    paymentMethod: paymentMethodDoc ? paymentMethodDoc._id : null,
    paymentScreenShot: req.body.paymentScreenShot,
    subtotal: price,
    couponCode: coupon ? coupon._id : null,
    discount: couponValue,
    total: finalPrice,
    notes: req.body.notes,
    adminNotes: req.body.adminNotes,
    purchaseSerial: purchaseSerial,
    status: "pending", // Default
  });

  if (!purchase) {
    return next(new AppError("Book purchase creation failed", 400));
  }

  if (purchase && coupon) {
    await coupon.markAsUsed(purchase._id, req.user._id);
  }

  // --- Referral logic ---
  if (req.user.referredBy) {
    const purchaseCount = await ECCartPurchase.countDocuments({
      createdBy: req.user._id,
    });
    if (purchaseCount === 1) {
      // First purchase?
      const {
        recalculateInviterSuccessfulInvites,
      } = require("./ec.referralController");
      await recalculateInviterSuccessfulInvites(req.user.referredBy);
    }
  }

  // --- Notification Logic ---
  try {
    const adminUsers = await User.find({
      role: { $in: ["Admin", "SubAdmin", "Moderator"] },
    }).select("_id name role");

    if (adminUsers.length > 0) {
      const notificationPromises = adminUsers.map((admin) => {
        return Notification.create({
          userId: admin._id,
          title: "طلب كتاب جديد (شراء مباشر)",
          message: `طلب كتاب جديد من ${req.user.name}\nرقم الطلب: ${purchaseSerial}\nالكتاب: ${product.title}\nالإجمالي: ${finalPrice} EGP`,
          type: "store_purchase",
          relatedId: purchase._id,
          metadata: {
            purchaseSerial: purchaseSerial,
            customerName: req.user.name,
            total: finalPrice,
            products: [{ title: product.title, price: price }],
          },
        });
      });
      await Promise.all(notificationPromises);
    }
  } catch (err) {
    console.error("Failed to send admin notifications for book purchase:", err);
  }

  // Update User Stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: {
      numberOfPurchases: 1,
      TotalSpentAmount: finalPrice,
    },
  });

  // Send email to user
  try {
    const { sendEmail } = require("../utils/emailVerification/emailService");
    await sendEmail(
      req.user.email,
      "Your Book Purchase Confirmation",
      `<div style='font-family: Arial, sans-serif;'>
        <h2>Thank you for your book purchase!</h2>
        <p>Dear ${req.user.name},</p>
        <p>Your book purchase (<b>${purchaseSerial}</b>) was successful.</p>
        <p>Book: <b>${product.title}</b></p>
        <p>Amount Paid: <b>${finalPrice}</b></p>
        <p>Your order is being processed by the Kalima team.</p>
        <p>If you have any questions, please contact support.</p>
        <br><p>Best regards,<br>Kalima Team</p>
      </div>`,
    );
  } catch (err) {
    console.error("Failed to send book purchase confirmation email:", err);
  }

  res.status(201).json({
    status: "success",
    data: {
      purchase,
      coupon: coupon ? coupon._id : null,
    },
  });
});

// Update book purchase
exports.updateBookPurchase = catchAsync(async (req, res, next) => {
  // Remove fields that shouldn't be updated directly
  delete req.body.createdBy;
  delete req.body.createdAt;
  delete req.body.purchaseSerial; // Prevent manual serial modification
  delete req.body.productId; // Prevent changing product after purchase
  delete req.body.paymentScreenShot; // Prevent changing payment screenshot directly
  // Only allow updating these fields
  const updatableFields = [
    "nameOnBook",
    "numberOnBook",
    "seriesName",
    "paymentScreenShot",
    "numberTransferredFrom",
    "notes",
    "adminNotes",
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
    },
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
    },
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
    return next(
      new AppError("No extended EC purchase found with that ID", 404),
    );
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
    return next(
      new AppError("User ID is required to get extended EC purchases", 400),
    );
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
    return next(
      new AppError(
        "No extended EC purchase found with that serial number",
        404,
      ),
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});
