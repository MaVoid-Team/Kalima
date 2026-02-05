const mongoose = require("mongoose");
const ECCartItem = require("../../models/ec.cartItemModel");
const ECCart = require("../../models/ec.cartModel");
const AppError = require("../../utils/appError");

const updateCartTotals = async (cartId) => {
  const stats = await ECCartItem.aggregate([
    { $match: { cart: new mongoose.Types.ObjectId(cartId) } },
    {
      $group: {
        _id: null,
        subtotal: { $sum: "$finalPrice" },
        count: { $sum: "$quantity" },
      },
    },
  ]);

  const subtotal = stats.length > 0 ? stats[0].subtotal : 0;
  const totalItems = stats.length > 0 ? stats[0].count : 0;

  const cart = await ECCart.findById(cartId)
    .select("couponCode")
    .populate("couponCode");

  let discount = 0;
  if (cart && cart.couponCode && cart.couponCode.value) {
    discount = cart.couponCode.value;
  }

  const total = Math.max(0, subtotal - discount);

  await ECCart.findByIdAndUpdate(cartId, {
    subtotal,
    discount,
    total,
    totalItems,
    lastUpdated: new Date(),
  });
};

const removeItemFromCart = async (cartId, itemId) => {
  const deletedItem = await ECCartItem.findOneAndDelete({
    _id: itemId,
    cart: cartId,
  });

  if (!deletedItem) {
    throw new AppError(
      `There is no cart item with ID ${itemId} in user cart`,
      404,
    );
  }

  await ECCart.findByIdAndUpdate(cartId, {
    $pull: { items: itemId },
  });

  await updateCartTotals(cartId);

  return deletedItem;
};

const clearCartItems = async (cartId) => {
  await ECCartItem.deleteMany({ cart: cartId });

  return await ECCart.findByIdAndUpdate(
    cartId,
    {
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      totalItems: 0,
      lastUpdated: new Date(),
    },
    { new: true },
  );
};

const validateCheckoutRules = (cartItems, body) => {
  const missingFields = [];

  const commonFields = ["numberTransferredFrom", "paymentScreenShot"];
  commonFields.forEach((field) => {
    if (!body[field]) missingFields.push(field);
  });

  const hasBooks = cartItems.some((item) => item.productType === "ECBook");

  if (hasBooks) {
    const bookFields = ["nameOnBook", "numberOnBook", "seriesName"];
    bookFields.forEach((field) => {
      if (!body[field]) missingFields.push(field);
    });
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
    );
  }
};

const createPurchaseRecords = async (
  user,
  cartItems,
  checkoutData,
  session,
) => {
  const purchases = [];

  for (const item of cartItems) {
    // Base Data (Shared by both types)
    const baseData = {
      userName: user.name,
      createdBy: user._id,
      productId: item.product._id,
      productName: item.productSnapshot.title,

      price: item.priceAtAdd,
      finalPrice: item.finalPrice,

      numberTransferredFrom: checkoutData.numberTransferredFrom,
      paymentScreenShot: checkoutData.paymentScreenShot,
      paymentNumber: item.productSnapshot.paymentNumber,

      purchaseSerial: `${user.userSerial}-${item.productSnapshot.section?.number || "00"}-${item.productSnapshot.serial}`,

      // Coupon (Per item logic now, or global if you kept it)
      // couponCode: item.couponCode
    };

    if (item.productType === "ECBook") {
      // Create Book Purchase
      const bookPurchase = await ECBookPurchase.create(
        [
          {
            ...baseData,
            // Book Specific Fields
            nameOnBook: checkoutData.nameOnBook,
            numberOnBook: checkoutData.numberOnBook,
            seriesName: checkoutData.seriesName,
          },
        ],
        { session },
      );

      purchases.push(bookPurchase[0]);
    } else {
      // Create Standard Purchase
      const purchase = await ECPurchase.create(
        [
          {
            ...baseData,
          },
        ],
        { session },
      );

      purchases.push(purchase[0]);
    }
  }

  return purchases;
};

const getCheckoutRequirements = (cartItems) => {
  const hasBooks = cartItems.some((item) => item.productType === "ECBook");

  return {
    hasBooks: hasBooks,
    requiresBookDetails: hasBooks,
    requiredFields: {
      common: ["numberTransferredFrom", "paymentScreenShot"],
      books: hasBooks ? ["nameOnBook", "numberOnBook", "seriesName"] : [],
    },
  };
};

module.exports = {
  updateCartTotals,
  removeItemFromCart,
  clearCartItems,
  validateCheckoutRules,
  createPurchaseRecords,
  getCheckoutRequirements,
};
