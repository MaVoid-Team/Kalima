const ECCartPurchase = require("../models/ec.cartPurchaseModel");
const ECCart = require("../models/ec.cartModel");
const ECCoupon = require("../models/ec.couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

    // Generate purchase serial using user's serial, date, and sequence
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

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

    // Clear the cart
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

exports.confirmCartPurchase = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findByIdAndUpdate(
        req.params.id,
        {
            confirmed: true,
            confirmedBy: req.user._id
        },
        {
            new: true,
            runValidators: true
        }
    );

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

// Admin routes
exports.getAllPurchases = catchAsync(async (req, res, next) => {
    // Build query
    const query = {};

    // Filter by confirmation status if specified
    if (req.query.confirmed !== undefined) {
        query.confirmed = req.query.confirmed === 'true';
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
        .populate('confirmedBy', 'name email')
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
    const stats = await ECCartPurchase.aggregate([
        {
            $match: {
                confirmed: true,
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
                }
            }
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