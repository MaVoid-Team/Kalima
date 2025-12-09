const ECCartPurchase = require("../models/ec.cartPurchaseModel");
const ECCart = require("../models/ec.cartModel");
const ECCoupon = require("../models/ec.couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { sendEmail } = require("../utils/emailVerification/emailService");
const { DateTime } = require('luxon');
const Notification = require("../models/notification");
const User = require("../models/userModel");
const mongoose = require('mongoose');

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
    }

    // Rate limiting: Check if user has made a purchase in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const recentPurchase = await ECCartPurchase.findOne({
        createdBy: req.user._id,
        createdAt: { $gte: thirtySecondsAgo }
    }).sort({ createdAt: -1 });

    if (recentPurchase) {
        const timeSinceLastPurchase = Date.now() - new Date(recentPurchase.createdAt).getTime();
        const remainingSeconds = Math.ceil((30000 - timeSinceLastPurchase) / 1000);
        return next(new AppError(`Please wait ${remainingSeconds} seconds before making another purchase`, 429));
    }

    // Get active cart
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

    // Validate payment info only if cart total > 0
    if (cart.total > 0) {
        const hasPaymentScreenshot = req.file || (req.files && req.files.paymentScreenShot && req.files.paymentScreenShot.length > 0);
        if (!req.body.numberTransferredFrom || !hasPaymentScreenshot) {
            return next(new AppError("Payment Screenshot and Number Transferred From are required", 400));
        }
        // if (!req.body.paymentMethod || !['instapay', 'vodafone cash'].includes(req.body.paymentMethod)) {
        //     return next(new AppError("Valid Payment Method is required (instapay or vodafone cash)", 400));
        // }
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

    // Prepare payment data (only if cart total > 0)
    const paymentFile = req.file || (req.files && req.files.paymentScreenShot && req.files.paymentScreenShot[0]);
    const paymentScreenShot = cart.total > 0 && paymentFile ? paymentFile.path : null;
    const numberTransferredFrom = cart.total > 0 ? req.body.numberTransferredFrom : null;

    // Prepare watermark file path
    const watermarkFile = req.files && req.files.watermark && req.files.watermark[0];
    const watermarkPath = watermarkFile ? watermarkFile.path : null;

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
        numberTransferredFrom: numberTransferredFrom,
        paymentNumber: cart.total > 0 ? cart.items[0].product.paymentNumber : null, // Only set payment number if cart has value
        paymentMethod: cart.total > 0 ? req.body.paymentMethod : null,
        paymentScreenShot: paymentScreenShot,
        subtotal: cart.subtotal,
        couponCode: cart.couponCode,
        discount: cart.discount,
        total: cart.total,
        notes: req.body.notes,
        purchaseSerial: purchaseSerial,
        watermark: watermarkPath,
    });

    // If there was a coupon, mark it as used
    if (cart.couponCode) {
        const coupon = await ECCoupon.findById(cart.couponCode);
        if (coupon) {
            await coupon.markAsUsed(purchase._id, req.user._id);
        }
    }

    // Format product list for notifications
    const productListHTML = cart.items.map((item, index) => {
        return `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; text-align: center;">${index + 1}</td>
                <td style="padding: 10px;">${item.product.title}</td>
            </tr>`;
    }).join('');

    const productListText = cart.items.map((item, index) => {
        return `${index + 1}. ${item.product.title}`;
    }).join('\n');

    const totalText = cart.total > 0 ? `${cart.total.toFixed(2)} EGP` : 'FREE';
    const discountText = cart.discount > 0 ? `\n- Discount: ${cart.discount.toFixed(2)} EGP` : '';

    // Send email notification
    try {
        await sendEmail(
            req.user.email,
            "Your Order Has Been Received",
            `<div dir="auto" style='font-family: Arial, sans-serif;'>
            <h2>Thank you for your purchase!</h2>
            <p>Dear ${req.user.name},</p>
            <p>We’re happy to let you know that your order (<b>${purchaseSerial}</b>) has been received.</p>
            <p>You have ordered <b>${cart.items.length}</b> product(s).</p>
            <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="text-align:center; padding: 8px; border-bottom: 1px solid #ddd;">##</th>
                        <th style="text-align:start; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
                    </tr>
                </thead>
                <tbody>
                    ${productListHTML}
                </tbody>
            </table>
            <p>Your order will be processed after the payment is reviewed by our team during working hours from <b>9:00 AM to 9:00 PM</b>.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br><b>Kalima Team</b></p>
            </div>`
        );
    } catch (err) {
        console.error("Failed to send purchase confirmation email:", err);
    }

    // Send WhatsApp notification
    try {
        if (req.user.phoneNumber) {
            const whatsappMessage = `🎉 *تأكيد الطلب*\n\nعزيزي ${req.user.name}،\n\nشكراً لطلبك!\n\n*رقم الطلب:* ${purchaseSerial}\n\n*المنتجات:*\n${productListText}\n${discountText}\n*الإجمالي: ${totalText}*\n\nسيتم معالجة طلبك خلال ساعات العمل (9 صباحاً - 9 مساءً).\n\nشكراً لاختيارك كلمة! 📚`;

            //console.log(`[WhatsApp Notification] Order confirmation for ${req.user.phoneNumber}:`, whatsappMessage);
            // In production, integrate with actual WhatsApp API here
            // await whatsappService.sendMessage(req.user.phoneNumber, whatsappMessage);
        }
    } catch (err) {
        console.error("Failed to send WhatsApp notification:", err);
    }

    // Send notifications to Admin, SubAdmin, and Moderator
    try {
        // Find all users with admin, subadmin, or moderator roles
        const adminUsers = await User.find({
            role: { $in: ['Admin', 'SubAdmin', 'Moderator'] }
        }).select('_id name role');

        const timestamp = new Date().toISOString();
        const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[CART PURCHASE NOTIFICATION ${requestId}] Found ${adminUsers.length} admin users:`, adminUsers.map(u => `${u.name} (${u.role})`));
        console.log(`[CART PURCHASE NOTIFICATION ${requestId}] Purchase ID: ${purchase._id}, Serial: ${purchaseSerial}`);
        console.log(`[CART PURCHASE NOTIFICATION ${requestId}] Timestamp: ${timestamp}`);

        if (adminUsers && adminUsers.length > 0) {
            // Create notification for each admin user
            const notificationPromises = adminUsers.map(admin => {
                console.log(`[CART PURCHASE NOTIFICATION ${requestId}] Creating notification for ${admin.name} (${admin.role}, ID: ${admin._id})`);
                return Notification.create({
                    userId: admin._id,
                    title: 'طلب جديد في المتجر',
                    message: `طلب جديد من ${req.user.name}\nرقم الطلب: ${purchaseSerial}\nعدد المنتجات: ${cart.items.length}\nالإجمالي: ${totalText}`,
                    type: 'store_purchase',
                    relatedId: purchase._id,
                    metadata: {
                        purchaseSerial: purchaseSerial,
                        customerName: req.user.name,
                        customerEmail: req.user.email,
                        customerPhone: req.user.phoneNumber,
                        itemCount: cart.items.length,
                        subtotal: cart.subtotal,
                        discount: cart.discount,
                        total: cart.total,
                        productList: productListText,
                        products: cart.items.map(item => ({
                            title: item.product.title,
                            price: item.priceAtAdd
                        })),
                        createdAt: new Date()
                    }
                });
            });

            const createdNotifications = await Promise.all(notificationPromises);
            console.log(`[CART PURCHASE NOTIFICATION ${requestId}] Successfully created ${createdNotifications.length} notifications for purchase ${purchaseSerial}`);
            createdNotifications.forEach((notif, index) => {
                console.log(`[CART PURCHASE NOTIFICATION ${requestId}]   - Notification ${index + 1}: ID=${notif._id}, User=${notif.userId}, Title=${notif.title}`);
            });
        } else {
            console.log(`[CART PURCHASE NOTIFICATION ${requestId}] No admin users found to notify`);
        }
    } catch (err) {
        console.error(`[CART PURCHASE NOTIFICATION ${requestId}] Failed to send admin notifications:`, err);
        // Don't fail the purchase if notifications fail
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
    if (purchase.status === 'confirmed') {
        return next(new AppError("Purchase is already confirmed", 400));
    }
    if (purchase.status !== 'received' && purchase.status !== 'returned') {
        return next(new AppError("Purchase must be received or in returned status before it can be confirmed", 400));
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

exports.returnCartPurchase = catchAsync(async (req, res, next) => {
    const purchase = await ECCartPurchase.findById(req.params.id);

    if (!purchase) {
        return next(new AppError("Purchase not found", 404));
    }
    if (purchase.status !== 'confirmed') {
        return next(new AppError("Only confirmed purchases can be returned", 400));
    }
    if (purchase.status === 'returned') {
        return next(new AppError("Purchase is already returned", 400));
    }
    if (purchase.confirmedBy.toString() !== req.user._id.toString()) {
        return next(new AppError("Only the user who confirmed the purchase can return it", 403));
    }

    const now = getCurrentEgyptTime().toJSDate();
    const updatedPurchase = await ECCartPurchase.findByIdAndUpdate(
        req.params.id,
        {
            status: 'returned',
            returnedAt: now,
            returnedBy: req.user._id // Already in Egypt time
        },
        {
            new: true,
            runValidators: true
        }
    )
    res.status(200).json({
        status: "success",
        message: "Purchase returned successfully",
    });
});

// Admin routes
exports.getAllPurchases = catchAsync(async (req, res, next) => {
    // Build base match filters (these will be applied in aggregation or simple query)
    const baseMatch = {};

    // Filter by status if specified
    if (req.query.status) {
        baseMatch.status = req.query.status;
    }

    // Filter by date range if specified
    if (req.query.startDate && req.query.endDate) {
        baseMatch.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    // Filter by minimum/maximum total if specified
    if (req.query.minTotal || req.query.maxTotal) {
        baseMatch.total = {};
        if (req.query.minTotal) baseMatch.total.$gte = parseFloat(req.query.minTotal);
        if (req.query.maxTotal) baseMatch.total.$lte = parseFloat(req.query.maxTotal);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // If a search term is present, use aggregation to allow matching on referenced `createdBy` user fields
    if (req.query.search) {
        const searchTermString = String(req.query.search || '').trim();
        // Escape special regex characters then create case-insensitive regex
        const searchRegex = new RegExp(searchTermString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        // Fast-path: if the search term is a 24-char hex string, treat it as an ObjectId and return that purchase directly
        if (/^[0-9a-fA-F]{24}$/.test(searchTermString)) {
            try {
                // Use the raw string id (Mongoose accepts string ids); this avoids casting issues
                const found = await ECCartPurchase.findById(searchTermString)
                    .populate({ path: 'createdBy', select: "name email role phoneNumber" })
                    .populate('confirmedBy', 'name')
                    .populate('receivedBy', 'name')
                    .populate('returnedBy', 'name')
                    .populate('adminNoteBy', 'name')
                    .populate('couponCode');
                // If baseMatch filters exist, ensure the found doc satisfies them
                let matchesBase = true;
                if (found && Object.keys(baseMatch).length > 0) {
                    if (baseMatch.status && found.status !== baseMatch.status) matchesBase = false;
                    if (baseMatch.createdAt) {
                        const gte = baseMatch.createdAt.$gte;
                        const lte = baseMatch.createdAt.$lte;
                        const created = new Date(found.createdAt);
                        if (gte && created < gte) matchesBase = false;
                        if (lte && created > lte) matchesBase = false;
                    }
                    if (baseMatch.total) {
                        if (baseMatch.total.$gte != null && (found.total == null || found.total < baseMatch.total.$gte)) matchesBase = false;
                        if (baseMatch.total.$lte != null && (found.total == null || found.total > baseMatch.total.$lte)) matchesBase = false;
                    }
                }

                const total = found && matchesBase ? 1 : 0;
                return res.status(200).json({
                    status: "success",
                    results: total,
                    pagination: {
                        total,
                        page: 1,
                        pages: total > 0 ? 1 : 0,
                        limit: 1
                    },
                    data: {
                        purchases: found && matchesBase ? [found] : []
                    }
                });
            } catch (err) {
                // if any error occurs, fall through to the aggregation approach
                console.error('Error in ObjectId fast-path search:', err);
            }
        }

        // Build $or conditions covering purchase fields, items snapshot and joined user fields
        const orMatch = [
            { userName: searchRegex },
            { purchaseSerial: searchRegex },
            { numberTransferredFrom: searchRegex },
            { 'items.productSnapshot.serial': searchRegex },
            { 'items.productSnapshot.title': searchRegex },
            { 'createdByUser.phoneNumber': searchRegex },
            { 'createdByUser.email': searchRegex },
            { 'createdByUser.name': searchRegex }
        ];

        // If the search looks like an ObjectId, add direct _id match
        if (/^[0-9a-fA-F]{24}$/.test(searchTermString)) {
            try {
                orMatch.push({ _id: mongoose.Types.ObjectId(searchTermString) });
            } catch (e) {
                // ignore invalid ObjectId conversion
            }
        }

        const pipeline = [];

        // Apply base filters first if any
        if (Object.keys(baseMatch).length > 0) pipeline.push({ $match: baseMatch });

        // Lookup user data for createdBy
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdByUser'
            }
        });
        pipeline.push({ $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } });

        // Match search OR conditions
        pipeline.push({ $match: { $or: orMatch } });

        // Sort, paginate
        pipeline.push({ $sort: { createdAt: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        // Execute aggregation for results
        const purchases = await ECCartPurchase.aggregate(pipeline);

        // Count total matching documents (separate pipeline)
        const countPipeline = [];
        if (Object.keys(baseMatch).length > 0) countPipeline.push({ $match: baseMatch });
        countPipeline.push({
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdByUser'
            }
        });
        countPipeline.push({ $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } });
        countPipeline.push({ $match: { $or: orMatch } });
        countPipeline.push({ $count: 'total' });

        const countResult = await ECCartPurchase.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Populate referenced fields for API response consistency while preserving aggregation order.
        // Using a single find with $in does not guarantee order; fetch each id individually in original order.
        const resultIds = purchases.map(p => p._id);
        const populated = [];
        if (resultIds.length > 0) {
            for (const id of resultIds) {
                const doc = await ECCartPurchase.findById(id)
                    .populate({ path: 'createdBy', select: "name email role phoneNumber" })
                    .populate('confirmedBy', 'name')
                    .populate('receivedBy', 'name')
                    .populate('returnedBy', 'name')
                    .populate('adminNoteBy', 'name')
                    .populate('couponCode');
                if (doc) populated.push(doc);
            }
        }

        return res.status(200).json({
            status: "success",
            results: populated.length,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            data: {
                purchases: populated
            }
        });
    }

    // No search — simple find with base filters
    const purchases = await ECCartPurchase.find(baseMatch)
        .populate({ path: 'createdBy', select: "name email role phoneNumber" })
        .populate('confirmedBy', 'name')
        .populate('receivedBy', 'name')
        .populate('returnedBy', 'name')
        .populate('adminNoteBy', 'name')
        .populate('couponCode')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await ECCartPurchase.countDocuments(baseMatch);

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
    // 1) Overview statistics
    const overviewAgg = await ECCartPurchase.aggregate([
        {
            $group: {
                _id: null,
                totalPurchases: { $sum: 1 },
                confirmedPurchases: {
                    $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
                },
                pendingPurchases: {
                    $sum: { $cond: [{ $ne: ["$status", "confirmed"] }, 1, 0] },
                },
                totalRevenue: { $sum: "$total" },
                confirmedRevenue: {
                    $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
                },
                averagePrice: { $avg: "$total" },
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

    // 2) Monthly statistics (last 12 months)
    const startOfWindow = DateTime.now().setZone('Africa/Cairo').minus({ months: 11 }).startOf('month').toJSDate();
    const monthlyStats = await ECCartPurchase.aggregate([
        { $match: { createdAt: { $gte: startOfWindow } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
                revenue: { $sum: "$total" },
                confirmedCount: {
                    $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
                },
                confirmedRevenue: {
                    $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
                },
            },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // 3) Daily statistics if a specific date is requested
    let dailyStats = null;
    if (req.query.date) {
        const dt = DateTime.fromISO(req.query.date, { zone: 'Africa/Cairo' });
        if (dt.isValid) {
            const startOfDay = dt.startOf('day').toJSDate();
            const endOfDay = dt.endOf('day').toJSDate();

            const [day] = await ECCartPurchase.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfDay, $lte: endOfDay },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPurchases: { $sum: 1 },
                        confirmedPurchases: {
                            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
                        },
                        pendingPurchases: {
                            $sum: { $cond: [{ $ne: ["$status", "confirmed"] }, 1, 0] },
                        },
                        totalRevenue: { $sum: "$total" },
                        confirmedRevenue: {
                            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, "$total", 0] },
                        },
                        averagePrice: { $avg: "$total" },
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

            dailyStats =
                day ||
                {
                    totalPurchases: 0,
                    confirmedPurchases: 0,
                    pendingPurchases: 0,
                    totalRevenue: 0,
                    confirmedRevenue: 0,
                    averagePrice: 0,
                };
        }
    }

    // 4) Respond
    res.status(200).json({
        status: "success",
        data: {
            overview: overviewAgg[0] || {
                totalPurchases: 0,
                confirmedPurchases: 0,
                pendingPurchases: 0,
                totalRevenue: 0,
                confirmedRevenue: 0,
                averagePrice: 0,
            },
            monthlyStats,
            dailyStats,
        },
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

        const sum = minutes.reduce((a, b) => a + b, 0);
        const average = Math.round(sum / minutes.length);
        const max = Math.round(Math.max(...minutes));

        // Compute min ignoring zero values (zero can mean no business minutes)
        const positive = minutes.filter(m => m > 0);
        const min = positive.length ? Math.round(Math.min(...positive)) : 0;

        // Helper to format minutes into "Xh Ym" (or "Zm" if <1 hour)
        const formatMinutes = (mins) => {
            if (mins == null) return null;
            const m = Math.round(mins);
            const h = Math.floor(m / 60);
            const mm = m % 60;
            if (h === 0) return `${mm}m`;
            return `${h}h ${mm}m`;
        };

        return {
            averageMinutes: formatMinutes(average),
            maxMinutes: formatMinutes(max),
            minMinutes: formatMinutes(min),
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

// Product-level purchase statistics
exports.getProductPurchaseStats = catchAsync(async (req, res, next) => {
    // Aggregate purchases by product id inside purchase items
    const stats = await ECCartPurchase.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalPurchases: { $sum: 1 },
                totalValue: { $sum: '$items.priceAtPurchase' },
            },
        },
        {
            $lookup: {
                from: 'ecproducts',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo',
            },
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                productId: '$_id',
                productName: '$productInfo.title',
                productSection: '$productInfo.section',
                totalPurchases: 1,
                totalValue: 1,
            },
        },
        { $sort: { totalPurchases: -1 } },
    ]);

    res.status(200).json({
        status: 'success',
        data: stats,
    });
});

// Get confirmed orders report with admin/moderator statistics
exports.getConfirmedOrdersReport = catchAsync(async (req, res, next) => {
    // Get all confirmed purchases
    const confirmedPurchases = await ECCartPurchase.find({
        status: 'confirmed'
    })
        .populate('confirmedBy', 'name email role')
        .populate('receivedBy', 'name email role')
        .populate('createdBy', 'name email phoneNumber')
        .populate('couponCode', 'couponCode value')
        .sort({ confirmedAt: -1 });

    // Calculate statistics by confirmer
    const confirmerStats = {};
    let totalConfirmedOrders = 0;
    let totalConfirmedRevenue = 0;

    confirmedPurchases.forEach(purchase => {
        totalConfirmedOrders++;
        totalConfirmedRevenue += purchase.total || 0;

        if (purchase.confirmedBy) {
            const confirmerId = purchase.confirmedBy._id.toString();

            if (!confirmerStats[confirmerId]) {
                confirmerStats[confirmerId] = {
                    admin: {
                        id: purchase.confirmedBy._id,
                        name: purchase.confirmedBy.name,
                        email: purchase.confirmedBy.email,
                        role: purchase.confirmedBy.role
                    },
                    totalConfirmed: 0,
                    totalRevenue: 0,
                    firstConfirmation: purchase.confirmedAt,
                    lastConfirmation: purchase.confirmedAt,
                    orders: []
                };
            }

            confirmerStats[confirmerId].totalConfirmed++;
            confirmerStats[confirmerId].totalRevenue += purchase.total || 0;

            // Update first and last confirmation dates
            if (new Date(purchase.confirmedAt) < new Date(confirmerStats[confirmerId].firstConfirmation)) {
                confirmerStats[confirmerId].firstConfirmation = purchase.confirmedAt;
            }
            if (new Date(purchase.confirmedAt) > new Date(confirmerStats[confirmerId].lastConfirmation)) {
                confirmerStats[confirmerId].lastConfirmation = purchase.confirmedAt;
            }

            confirmerStats[confirmerId].orders.push({
                purchaseId: purchase._id,
                purchaseSerial: purchase.purchaseSerial,
                customerName: purchase.userName,
                total: purchase.total,
                confirmedAt: purchase.confirmedAt,
                itemCount: purchase.items?.length || 0
            });
        }
    });

    // Convert to array and sort by total confirmed
    const confirmerStatsArray = Object.values(confirmerStats).sort(
        (a, b) => b.totalConfirmed - a.totalConfirmed
    );

    // Calculate average confirmation time (from received to confirmed)
    const purchasesWithTimes = confirmedPurchases.filter(
        p => p.receivedAt && p.confirmedAt
    );

    let totalConfirmationTime = 0;
    purchasesWithTimes.forEach(purchase => {
        const timeDiff = new Date(purchase.confirmedAt) - new Date(purchase.receivedAt);
        totalConfirmationTime += timeDiff;
    });

    const averageConfirmationTime = purchasesWithTimes.length > 0
        ? Math.round(totalConfirmationTime / purchasesWithTimes.length / 1000 / 60) // in minutes
        : 0;

    res.status(200).json({
        status: 'success',
        data: {
            summary: {
                totalConfirmedOrders,
                totalConfirmedRevenue,
                averageConfirmationTimeMinutes: averageConfirmationTime,
                totalConfirmers: confirmerStatsArray.length
            },
            confirmerStats: confirmerStatsArray,
            recentConfirmedOrders: confirmedPurchases.slice(0, 50) // Last 50 confirmed orders
        }
    });
});