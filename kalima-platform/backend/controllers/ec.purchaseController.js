
const ECPurchase = require("../models/ec.purchaseModel");
const ECCoupon = require("../models/ec.couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const QueryFeatures = require("../utils/queryFeatures");
const ECProduct = require("../models/ec.productModel");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/emailVerification/emailService");
const Notification = require("../models/notification");
const NotificationTemplate = require("../models/notificationTemplateModel");
const User = require("../models/userModel");

// Get all purchases
exports.getAllPurchases = catchAsync(async (req, res, next) => {
  let query = ECPurchase.find();
  let searchApplied = false;
  let searchFilter = {};

  // Handle search parameter
  if (req.query.search) {
    const searchTerm = req.query.search;
    const searchRegex = new RegExp(searchTerm, "i"); // Case-insensitive

    searchFilter.$or = [
      { productName: searchRegex },
      { userName: searchRegex },
      { purchaseSerial: searchRegex },
      { numberTransferredFrom: searchRegex },
      { "createdBy.email": searchRegex },
      { "createdBy.name": searchRegex },
      { "productId.title": searchRegex },
      { "productId.serial": searchRegex },
    ];

    searchApplied = true;
    delete req.query.search;
  }

  // Handle date filter (exact day)
  if (req.query.date) {
    const inputDate = new Date(req.query.date);
    if (!isNaN(inputDate)) {
      const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

      searchFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
      searchApplied = true;
    }
    delete req.query.date;
  }

  // Apply combined search + date filter
  if (searchApplied) {
    query = query.find(searchFilter);
  }

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  // Count query for pagination
  let totalQuery = ECPurchase.find();
  if (searchApplied) {
    totalQuery = totalQuery.find(searchFilter);
  }

  const totalPurchases = await ECPurchase.countDocuments(
    totalQuery.getFilter ? totalQuery.getFilter() : totalQuery._conditions,
  );

  // Populate & execute
  const purchases = await features.query.populate([
    { path: "createdBy", select: "name email role phoneNumber" },
    { path: "confirmedBy", select: "name email role" },
    { path: "adminNoteBy", select: "name" },
    { path: "couponCode", select: "couponCode value expirationDate" },
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
  ]);

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
    { path: "adminNoteBy", select: "name" }, // populate the new field
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

// Create new purchase (Refactored to use ECCartPurchase for unified order system)
exports.createPurchase = catchAsync(async (req, res, next) => {
  const ECCartPurchase = require("../models/ec.cartPurchaseModel");
  const PaymentMethod = require("../models/paymentMethodModel");
  const { DateTime } = require("luxon");

  // Handle payment screenshot upload
  let paymentScreenShotPath = null;
  if (req.file && req.file.fieldname === "paymentScreenShot") {
    paymentScreenShotPath = req.file.path;
    req.body.paymentScreenShot = paymentScreenShotPath;
  } else if (!req.body.paymentScreenShot) {
    req.body.paymentScreenShot = null;
  }

  const product = await ECProduct.findById(req.body.productId).populate(
    "section",
    "number",
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
    if (coupon.isActive === false) {
      return next(new AppError("Coupon code has already been used", 400));
    }
  }

  // Set the creator
  req.body.createdBy = req.user._id;
  req.body.userName = req.user.name;

  // Calculate pricing
  const price = product.priceAfterDiscount;
  const couponValue = coupon ? coupon.value * 1 : 0;
  const finalPrice = price * 1 - couponValue;

  // Validate payment info (assuming direct purchase is never free unless price is 0)
  let paymentMethodDoc = null;
  // If price > 0, validate payment method
  if (finalPrice > 0) {
    /* 
         Note: The frontend allows "Buy Now" without payment method sometimes if strictly following schema,
         but usually requires it. We'll try to find payment method if ID is provided.
         If not provided but required, consistent with cart logic, we might need it.
         However, to avoid breaking frontend that might not send it if not selected (legacy), 
         we check if it exists in body.
      */
    if (req.body.paymentNumber) {
      // Try to find payment method by phone number if ID not sent (legacy behavior support)
      // Or just rely on req.body.paymentMethod if frontend sends it (which it seems to do now)
    }

    if (
      req.body.paymentMethod &&
      mongoose.Types.ObjectId.isValid(req.body.paymentMethod)
    ) {
      paymentMethodDoc = await PaymentMethod.findById(req.body.paymentMethod);
    }
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
  // Format: USER-CP-DATE-SEQ (e.g. U123-CP-20231027-001)
  const purchaseSerial = `${userSerial}-CP-${formattedDate}-${formattedSequence}`;

  // Construct Item for ECCartPurchase
  const item = {
    product: product._id,
    productType: product.__t || "ECProduct",
    priceAtPurchase: price,
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
    adminNotes: req.body.adminNotes, // Support direct admin notes if passed
    adminNoteBy: req.body.adminNoteBy,
    purchaseSerial: purchaseSerial,
    status: "pending", // Default status
  });

  if (!purchase) {
    return next(new AppError("Purchase creation failed", 400));
  }

  if (purchase && coupon) {
    await coupon.markAsUsed(purchase._id, req.user._id);
  }

  // --- Referral successful invite logic ---
  if (req.user.referredBy) {
    // Count ALL purchases types? For now, stick to checking ECPurchase count or ECCartPurchase count
    // The original logic checked ECPurchase count. We should probably check ECCartPurchase count now.
    // But since we just created one, count should be >= 1.
    // Let's check if this is their FIRST purchase in ECCartPurchase.
    const purchaseCount = await ECCartPurchase.countDocuments({
      createdBy: req.user._id,
    });
    if (purchaseCount === 1) {
      const {
        recalculateInviterSuccessfulInvites,
      } = require("./ec.referralController");
      await recalculateInviterSuccessfulInvites(req.user.referredBy);
    }
  }

  // --- Notification Logic (Reusing simple logic for now, or copy from Cart) ---
  // To ensure Admins see it, we should create Notifications.
  try {
    const adminUsers = await User.find({
      role: { $in: ["Admin", "SubAdmin", "Moderator"] },
    }).select("_id name role");

    if (adminUsers.length > 0) {
      const notificationPromises = adminUsers.map((admin) => {
        return Notification.create({
          userId: admin._id,
          title: "طلب جديد في المتجر (شراء مباشر)",
          message: `طلب جديد من ${req.user.name}\nرقم الطلب: ${purchaseSerial}\nالمنتج: ${product.title}\nالإجمالي: ${finalPrice} EGP`,
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
    console.error(
      "Failed to send admin notifications for direct purchase:",
      err,
    );
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
    await sendEmail(
      req.user.email,
      "Your Purchase Confirmation",
      `<div style='font-family: Arial, sans-serif;'>
        <h2>Thank you for your purchase!</h2>
        <p>Dear ${req.user.name},</p>
        <p>Your purchase (<b>${purchaseSerial}</b>) was successful.</p>
        <p>Product: <b>${product.title}</b></p>
        <p>Amount Paid: <b>${finalPrice}</b></p>
        <p>Your order is being processed by Kalima team.</p>
        <p>If you have any questions, please contact support.</p>
        <br><p>Best regards,<br>Kalima Team</p>
      </div>`,
    );
  } catch (err) {
    console.error("Failed to send purchase confirmation email:", err);
  }

  res.status(201).json({
    status: "success",
    data: {
      purchase,
      coupon: coupon ? coupon._id : null,
    },
  });
});

// Update purchase
exports.updatePurchase = catchAsync(async (req, res, next) => {
  // Get the current purchase to compare changes
  const oldPurchase = await ECPurchase.findById(req.params.id);

  if (!oldPurchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  // Detect if adminNote is being added or changed
  const isAdminNoteChanged =
    req.body.adminNotes && req.body.adminNotes !== oldPurchase.adminNotes;

  if (isAdminNoteChanged) {
    req.body.adminNoteBy = req.user._id; // whoever is logged in
  }

  // Your existing update logic
  const purchase = await ECPurchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "createdBy", select: "name email role" },
    { path: "confirmedBy", select: "name email role" },
    { path: "adminNoteBy", select: "name" }, // populate the new field
    {
      path: "productId",
      select: "title serial priceAfterDiscount section thumbnail",
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { purchase },
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
    },
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
  // 1) إحصائيات عامة
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
        totalRevenue: { $sum: "$finalPrice" },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, "$finalPrice", 0] },
        },
        averagePrice: { $avg: "$finalPrice" },
      },
    },
    {
      $project: {
        totalPurchases: 1,
        confirmedPurchases: 1,
        pendingPurchases: 1,
        totalRevenue: 1,
        confirmedRevenue: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
      },
    },
  ]);

  // 2) إحصائيات شهرية (آخر 12 شهر)
  const monthlyStats = await ECPurchase.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        revenue: { $sum: "$finalPrice" },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, 1, 0] },
        },
        confirmedRevenue: {
          $sum: { $cond: [{ $eq: ["$confirmed", true] }, "$finalPrice", 0] },
        },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);

  // 3) إحصائيات اليوم المحدد (إن وُجد date)
  let dailyStats = null;
  if (req.query.date) {
    const targetDate = new Date(req.query.date);
    if (!isNaN(targetDate)) {
      const startOfDay = new Date(targetDate).setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate).setHours(23, 59, 59, 999);

      const [day] = await ECPurchase.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
          },
        },
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
            totalRevenue: { $sum: "$finalPrice" },
            confirmedRevenue: {
              $sum: {
                $cond: [{ $eq: ["$confirmed", true] }, "$finalPrice", 0],
              },
            },
            averagePrice: { $avg: "$finalPrice" },
          },
        },
        {
          $project: {
            totalPurchases: 1,
            confirmedPurchases: 1,
            pendingPurchases: 1,
            totalRevenue: 1,
            confirmedRevenue: 1,
            averagePrice: { $round: ["$averagePrice", 2] },
          },
        },
      ]);

      dailyStats = day || {
        totalPurchases: 0,
        confirmedPurchases: 0,
        pendingPurchases: 0,
        totalRevenue: 0,
        confirmedRevenue: 0,
        averagePrice: 0,
      };
    }
  }

  // 4) الردّ
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
      // ستُرجع إما كائن stats لليوم المحدد أو null إذا لم يُرسل date
      dailyStats,
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

// Get stats for every product: product name, section, total value, and number of purchases
exports.getProductPurchaseStats = catchAsync(async (req, res, next) => {
  const stats = await ECPurchase.aggregate([
    {
      $group: {
        _id: "$productId",
        totalPurchases: { $sum: 1 },
        totalValue: { $sum: "$finalPrice" },
        couponIds: { $push: "$couponCode" }, // collect coupon IDs for later lookup
      },
    },
    {
      $lookup: {
        from: "ecproducts",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    // Lookup all coupons used for this product's purchases
    {
      $lookup: {
        from: "eccoupons",
        let: { couponIds: "$couponIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", "$$couponIds"] },
                  { $ne: ["$_id", null] },
                ],
              },
            },
          },
          { $group: { _id: null, totalCouponValue: { $sum: "$value" } } },
        ],
        as: "couponStats",
      },
    },
    {
      $addFields: {
        totalCouponValue: {
          $ifNull: [{ $arrayElemAt: ["$couponStats.totalCouponValue", 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productInfo.title",
        productSection: "$productInfo.section",
        totalPurchases: 1,
        totalValue: 1,
        totalCouponValue: 1,
      },
    },
    { $sort: { totalPurchases: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: stats,
  });
});