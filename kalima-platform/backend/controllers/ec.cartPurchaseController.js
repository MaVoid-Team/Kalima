const ECCartPurchase = require("../models/ec.cartPurchaseModel");
const ECCart = require("../models/ec.cartModel");
const ECCoupon = require("../models/ec.couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendEmail } = require("../utils/emailVerification/emailService");
const { DateTime } = require('luxon');

// Function to get current time in Egypt timezone
const getCurrentEgyptTime = () => {
    return DateTime.now().setZone('Africa/Cairo');
};

// Default start date for statistics
const DEFAULT_STATS_START_DATE = new Date('2025-11-01');

exports.createCartPurchase = catchAsync(async (req, res, next) => {
    // Check if user serial exists
    if (!req.user.userSerial) {
        return next(new AppError("User serial not found", 400));
    }    // Get active cart
    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    }).populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title thumbnail priceAfterDiscountpaymentNumber'
        }
    }).populate('couponCode');

    if (!cart || cart.items.length === 0) {
        return next(new AppError("Cart is empty", 400));
    }

    // Validate book details if needed
    const hasBooks = await cart.hasBooks();
    if (hasBooks && (!req.body.nameOnBook || !req.body.numberOnBook || !req.body.seriesName)) {
        return next(new AppError("Book details are required \n name on book \n number on book \n series name", 400));
    }

    // Validate payment info
    if (!req.body.numberTransferredFrom || !req.file) {
        return next(new AppError("Payment Screenshot and Number Transferred From are required", 400));
    }

    // Prepare items with snapshots
    const items = cart.items.map(item => ({
        product: item.product._id,
        productType: item.product.__t || 'ECProduct',
        priceAtPurchase: item.priceAtAdd,
        nameOnBook: item.product.__t === 'ECBook' ? req.body.nameOnBook : undefined,
        numberOnBook: item.product.__t === 'ECBook' ? req.body.numberOnBook : undefined,
        seriesName: item.product.__t === 'ECBook' ? req.body.seriesName : undefined,
        productSnapshot: {
            title: item.product.title,
            thumbnail: item.product.thumbnail,
            section: item.product.section,
            serial: item.product.serial
        }
    }));

    // Generate purchase serial using user's serial, date, and sequence in Egypt time
    const date = getCurrentEgyptTime();
    const formattedDate = date.toFormat('yyyyMMdd'); // Format: YYYYMMDD

    // Find the last purchase of the day to determine sequence number
    const lastPurchase = await ECCartPurchase.findOne({
        purchaseSerial: new RegExp(`${req.user.userSerial}-CP-${formattedDate}-\\d+$`),
    }).sort({ purchaseSerial: -1 });

    // Get the next sequence number
    let sequence = 1;
    if (lastPurchase) {
        const lastSequence = parseInt(lastPurchase.purchaseSerial.split('-').pop());
        sequence = lastSequence + 1;
    }

    // Format sequence as 3 digits (001, 002, etc.)
    const formattedSequence = sequence.toString().padStart(3, '0');
    const purchaseSerial = `${req.user.userSerial}-CP-${formattedDate}-${formattedSequence}`;

    // Create the purchase
    const purchase = await ECCartPurchase.create({
        userName: req.user.name,
        createdBy: req.user._id,
        items: items,
        numberTransferredFrom: req.body.numberTransferredFrom,
        paymentNumber: cart.items[0].product.paymentNumber, // Assuming same payment number for all products
        paymentScreenShot: req.file.path,
        subtotal: cart.subtotal,
        couponCode: cart.couponCode,
        discount: cart.discount,
        total: cart.total,
        notes: req.body.notes,
        purchaseSerial: purchaseSerial
    });

    // If there was a coupon, mark it as used
    if (cart.couponCode) {
        const coupon = await ECCoupon.findById(cart.couponCode);
        if (coupon) {
            await coupon.markAsUsed(purchase._id, req.user._id);
        }
    }

    try {
        await sendEmail(
            req.user.email,
            "Your Order Has Been Received",
            `<div style='font-family: Arial, sans-serif;'>
            <h2>Thank you for your purchase!</h2>
            <p>Dear ${req.user.name},</p>
            <p>We’re happy to let you know that your order (<b>${purchaseSerial}</b>) has been received.</p>
            <p>You have ordered <b>${cart.items.length}</b> product(s).</p>
            <p>Your order will be processed after the payment is reviewed by our team during working hours from <b>9:00 AM to 9:00 PM</b>.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br><b>Kalima Team</b></p>
            </div>`
        );
    } catch (err) {
        console.error("Failed to send purchase confirmation email:", err);
    }

    await cart.clear();
    // Return the created purchase
    res.status(201).json({
        status: "success",
        data: {
            purchase
        }
    });
});

exports.getCartPurchases = catchAsync(async (req, res, next) => {
    const purchases = await ECCartPurchase.find({
        createdBy: req.user._id
    }).sort('-createdAt').populate('couponCode');

    res.status(200).json({
        status: "success",
        results: purchases.length,
        data: {
            purchases
        }
    });
});

exports.getCartPurchaseById = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findById(req.params.id)
        .populate('couponCode')
        .populate('createdBy', 'name email')
        .populate('confirmedBy', 'name email')
        .populate('adminNoteBy', 'name');

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            purchase
        }
    });
});

exports.receivePurchase = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findById(req.params.id);

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    if (purchase.status !== 'pending') {
        return next(new AppError(`Purchase is already ${purchase.status}`, 400));
    }

    const now = getCurrentEgyptTime().toJSDate();
    const updatedPurchase = await ECCartPurchase.findByIdAndUpdate(
        req.params.id,
        {
            status: 'received',
            receivedBy: req.user._id,
            receivedAt: now  // Already in Egypt time
        },
        {
            new: true,
            runValidators: true
        }
    )

    res.status(200).json({
        status: "success",
        message: "Purchase marked as received successfully",
    });
});

exports.confirmCartPurchase = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findById(req.params.id);

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    if (purchase.status !== 'received') {
        return next(new AppError("Purchase must be received before it can be confirmed", 400));
    }

    const now = getCurrentEgyptTime().toJSDate();
    const updatedPurchase = await ECCartPurchase.findByIdAndUpdate(
        req.params.id,
        {
            status: 'confirmed',
            confirmedBy: req.user._id,
            confirmedAt: now  // Already in Egypt time
        },
        {
            new: true,
            runValidators: true
        }
    )
    res.status(200).json({
        status: "success",
        message: "Purchase confirmed successfully",
    });
});

// Admin routes
exports.getAllPurchases = catchAsync(async (req, res, next) => {
    // Build query
    const query = {};

    // Filter by status if specified
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by date range if specified
    if (req.query.startDate && req.query.endDate) {
        query.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    // Filter by minimum/maximum total if specified
    if (req.query.minTotal || req.query.maxTotal) {
        query.total = {};
        if (req.query.minTotal) query.total.$gte = parseFloat(req.query.minTotal);
        if (req.query.maxTotal) query.total.$lte = parseFloat(req.query.maxTotal);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const purchases = await ECCartPurchase.find(query)
        .populate({ path: 'createdBy', select: "name email role phoneNumber" })
        .populate('confirmedBy', 'name')
        .populate('receivedBy', 'name')
        .populate('adminNoteBy', 'name')
        .populate('couponCode')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    // Get total count for pagination
    const total = await ECCartPurchase.countDocuments(query);

    res.status(200).json({
        status: "success",
        results: purchases.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        },
        data: {
            purchases
        }
    });
});

exports.addAdminNote = catchAsync(async (req, res, next) => {
    if (!req.body.adminNotes) {
        return next(new AppError("Admin note is required", 400));
    }

    const purchase = await ECCartPurchase.findByIdAndUpdate(
        req.params.id,
        {
            adminNotes: req.body.adminNotes,
            adminNoteBy: req.user._id
        },
        {
            new: true,
            runValidators: true
        }
    ).populate('createdBy', 'name email')
        .populate('confirmedBy', 'name email')
        .populate('adminNoteBy', 'name');

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            purchase
        }
    });
});

exports.getPurchaseStatistics = catchAsync(async (req, res, next) => {
    // Build match condition
    const matchCondition = {
        status: 'confirmed'
    };

    // Add date filter if provided
    if (req.query.startDate || req.query.endDate) {
        matchCondition.createdAt = {};
        if (req.query.startDate) {
            matchCondition.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            matchCondition.createdAt.$lte = new Date(req.query.endDate);
        }
    }

    const stats = await ECCartPurchase.aggregate([
        {
            $match: matchCondition
        },
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$total" },
                avgOrderValue: { $avg: "$total" },
                totalOrders: { $sum: 1 },
                totalItems: { $sum: { $size: "$items" } },
                totalDiscount: { $sum: "$discount" }
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            statistics: stats[0] || {
                totalSales: 0,
                avgOrderValue: 0,
                totalOrders: 0,
                totalItems: 0,
                totalDiscount: 0
            }
        }
    });
});

exports.getResponseTimeStatistics = catchAsync(async (req, res, next) => {
    const startDate = req.query.startDate
        ? DateTime.fromISO(req.query.startDate).setZone('Africa/Cairo').startOf('day').toJSDate()
        : DateTime.fromJSDate(DEFAULT_STATS_START_DATE).setZone('Africa/Cairo').startOf('day').toJSDate();

    const endDate = req.query.endDate
        ? DateTime.fromISO(req.query.endDate).setZone('Africa/Cairo').endOf('day').toJSDate()
        : getCurrentEgyptTime().endOf('day').toJSDate();

    // Get purchases within date range
    const purchases = await ECCartPurchase.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).select('createdAt receivedAt confirmedAt status');

    // Helper function to calculate business minutes between two dates
    const calculateBusinessMinutes = (startDate, endDate) => {
        const BUSINESS_START_HOUR = 9; // 9 AM
        const BUSINESS_END_HOUR = 21;  // 9 PM
        const BUSINESS_HOURS_PER_DAY = BUSINESS_END_HOUR - BUSINESS_START_HOUR;

        // Convert to local time
        const start = new Date(startDate);
        const end = new Date(endDate);

        // If same day
        if (start.toDateString() === end.toDateString()) {
            let startHour = start.getHours();
            let endHour = end.getHours();
            let startMinutes = start.getMinutes();
            let endMinutes = end.getMinutes();

            // Adjust hours to business hours
            startHour = Math.max(startHour, BUSINESS_START_HOUR);
            startHour = Math.min(startHour, BUSINESS_END_HOUR);
            endHour = Math.max(endHour, BUSINESS_START_HOUR);
            endHour = Math.min(endHour, BUSINESS_END_HOUR);

            // Calculate minutes within business hours
            const hourDiff = endHour - startHour;
            const minuteDiff = endMinutes - startMinutes;

            return Math.max(0, hourDiff * 60 + minuteDiff);
        }

        // Multiple days
        let totalMinutes = 0;

        // First day
        const firstDayEnd = new Date(start);
        firstDayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);
        if (start.getHours() < BUSINESS_END_HOUR) {
            const startHour = Math.max(start.getHours(), BUSINESS_START_HOUR);
            totalMinutes += (BUSINESS_END_HOUR - startHour) * 60 - start.getMinutes();
        }

        // Last day
        const lastDayStart = new Date(end);
        lastDayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);
        if (end.getHours() > BUSINESS_START_HOUR) {
            const endHour = Math.min(end.getHours(), BUSINESS_END_HOUR);
            totalMinutes += (endHour - BUSINESS_START_HOUR) * 60 + end.getMinutes();
        }

        // Full days in between
        const fullDays = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)) - 1);
        totalMinutes += fullDays * BUSINESS_HOURS_PER_DAY * 60;

        return Math.max(0, totalMinutes);
    };

    // Calculate statistics
    const receiveStats = [];
    const confirmStats = [];
    const totalStats = [];
    const statusCounts = {};

    purchases.forEach(purchase => {
        // Count statuses
        const status = purchase.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (purchase.receivedAt) {
            const receiveMinutes = calculateBusinessMinutes(purchase.createdAt, purchase.receivedAt);
            receiveStats.push(receiveMinutes);

            if (purchase.confirmedAt) {
                const confirmMinutes = calculateBusinessMinutes(purchase.receivedAt, purchase.confirmedAt);
                confirmStats.push(confirmMinutes);

                const totalMinutes = calculateBusinessMinutes(purchase.createdAt, purchase.confirmedAt);
                totalStats.push(totalMinutes);
            }
        }
    });

    // Helper function to calculate statistics
    const calculateStats = (minutes) => {
        if (!minutes || minutes.length === 0) return null;
        return {
            averageMinutes: Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length),
            maxMinutes: Math.round(Math.max(...minutes)),
            minMinutes: Math.round(Math.min(...minutes)),
            count: minutes.length
        };
    };

    res.status(200).json({
        status: "success",
        data: {
            period: req.query.startDate || req.query.endDate ? "Custom range" : "Current month",
            dateRange: {
                start: startDate,
                end: endDate,
                description: req.query.startDate || req.query.endDate ?
                    "Custom date range" :
                    "Since November 1st, 2025"
            },
            receiveTime: calculateStats(receiveStats),
            confirmTime: calculateStats(confirmStats),
            totalResponseTime: calculateStats(totalStats),
            currentStatus: statusCounts
        }
    });
});

exports.deletePurchase = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findById(req.params.id);

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }

    // If the purchase was confirmed and used a coupon, we need to un-mark the coupon as used
    if (purchase.confirmed && purchase.couponCode) {
        const coupon = await ECCoupon.findById(purchase.couponCode);
        if (coupon) {
            // Remove this purchase from coupon's usedBy array
            await ECCoupon.findByIdAndUpdate(
                purchase.couponCode,
                {
                    $pull: {
                        usedBy: {
                            purchase: purchase._id,
                            user: purchase.createdBy
                        }
                    }
                }
            );
        }
    }

    // Delete the purchase
    await ECCartPurchase.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: "success",
        message: "Purchase deleted successfully"
    });
});