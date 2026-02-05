const ECCart = require("../../models/ec.cartModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");

const getCart = catchAsync(async (req, res, next) => {
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
        return next(new AppError("Cart not found", 404));
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

module.exports = {
    getCart
};