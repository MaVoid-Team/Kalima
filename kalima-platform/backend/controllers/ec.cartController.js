const ECCart = require("../models/ec.cartModel");
const ECCartItem = require("../models/ec.cartItemModel");
const ECProduct = require("../models/ec.productModel");
const ECCoupon = require("../models/ec.couponModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get user's active cart
exports.getCart = catchAsync(async (req, res, next) => {
    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    }).populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title thumbnail price priceAfterDiscount section'
        }
    }).populate('couponCode');

    if (!cart) {
        return res.status(200).json({
            status: "success",
            data: {
                cart: null,
                itemCount: 0
            }
        });
    }

    // Get the number of items in cart
    const itemCount = cart.items ? cart.items.length : 0;

    res.status(200).json({
        status: "success",
        data: {
            itemCount,
            cart
        }
    });
});

// Add item to cart
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    // Validate product exists
    const product = await ECProduct.findById(productId);
    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    // Get or create user's cart
    let cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    });

    if (!cart) {
        cart = await ECCart.create({
            user: req.user._id,
            status: "active"
        });
    }

    try {
        // Add item to cart (quantity is fixed to 1)
        await cart.addItem(productId);
    } catch (error) {
        if (error.message === 'Product already exists in cart') {
            return next(new AppError("Product is already in cart", 400));
        }
        throw error;
    }

    // Return updated cart
    await cart.populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title thumbnail price priceAfterDiscount section'
        }
    });

    res.status(200).json({
        status: "success",
        data: { cart }
    });
});


exports.removeFromCart = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;

    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    });

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    await cart.removeItem(itemId);

    // Return updated cart
    await cart.populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title thumbnail price priceAfterDiscount section'
        }
    });

    res.status(200).json({
        status: "success",
        data: { cart }
    });
});


exports.applyCoupon = catchAsync(async (req, res, next) => {
    const { couponCode } = req.body;

    // Find the coupon
    const coupon = await ECCoupon.findOne({ couponCode });
    if (!coupon) {
        return next(new AppError("Invalid coupon code", 400));
    }

    // Validate coupon is active and not already used
    if (!coupon.isActive) {
        return next(new AppError("This coupon has already been used", 400));
    }

    // Validate coupon expiration
    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
        return next(new AppError("Coupon has expired", 400));
    }

    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    }).populate('items');

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    if (cart.items.length === 0) {
        return next(new AppError("Cannot apply coupon to empty cart", 400));
    }

    // Apply coupon and update totals
    await cart.applyCoupon(coupon._id);

    // Return updated cart
    await cart.populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title thumbnail price priceAfterDiscount section'
        }
    });

    res.status(200).json({
        status: "success",
        data: { cart }
    });
});



exports.clearCart = catchAsync(async (req, res, next) => {
    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    });

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    await cart.clear();

    res.status(200).json({
        status: "success",
        data: { cart }
    });
});

exports.checkout = catchAsync(async (req, res, next) => {
    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    }).populate('items').populate('user', 'name userSerial');

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    if (cart.items.length === 0) {
        return next(new AppError("Cannot checkout with empty cart", 400));
    }

    // Validate checkout data against required fields
    const requirements = await cart.getRequiredCheckoutFields();
    const missingFields = [];

    // Check common fields
    requirements.requiredFields.common.forEach(field => {
        if (!req.body[field]) missingFields.push(field);
    });

    // Check book fields if needed
    if (requirements.requiresBookDetails) {
        requirements.requiredFields.books.forEach(field => {
            if (!req.body[field]) missingFields.push(field);
        });
    }

    if (missingFields.length > 0) {
        return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    // Process payment screenshot
    if (req.file) {
        req.body.paymentScreenShot = req.file.path;
    }

    // Convert cart to purchases
    const purchases = await cart.convertToPurchases(req.body);

    // Complete purchase and clear cart
    await cart.completePurchase(purchases);

    res.status(200).json({
        status: "success",
        data: {
            purchases
        }
    });
});

exports.getCheckoutPreview = catchAsync(async (req, res, next) => {
    const cart = await ECCart.findOne({
        user: req.user._id,
        status: "active"
    }).populate({
        path: 'itemsWithDetails',
        populate: {
            path: 'product',
            select: 'title priceAfterDiscount serial'
        }
    });

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    // Get required fields based on cart contents
    const checkoutRequirements = await cart.getRequiredCheckoutFields();
    const hasBooks = await cart.hasBooks();

    res.status(200).json({
        status: "success",
        data: {
            cart,
            hasBooks,
            requiresBookDetails: hasBooks,
            checkoutRequirements
        }
    });
});