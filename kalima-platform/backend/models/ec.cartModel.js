const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true, // One active cart per user
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ECCartItem",
      },
    ],
    couponCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECCoupon",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ lastUpdated: 1 });

cartSchema.virtual("itemsWithDetails", {
  ref: "ECCartItem",
  localField: "_id",
  foreignField: "cart",
  options: { populate: { path: "product" } },
});

cartSchema.methods.updateTotals = async function () {
  // Populate items if not already populated
  if (!this.populated("items")) {
    await this.populate("items");
  }

  this.subtotal = this.items.reduce((sum, item) => sum + item.finalPrice, 0);

  // Apply discount if coupon exists
  if (this.couponCode) {
    await this.populate("couponCode");
    if (this.couponCode && this.couponCode.value) {
      // Apply full coupon value as discount
      this.discount = this.couponCode.value;
    }
  }

  // Ensure total is never negative
  this.total = Math.max(0, this.subtotal - this.discount);

  this.lastUpdated = new Date();

  return this.save();
};

cartSchema.methods.addItem = async function (productId) {
  const ECProduct = mongoose.model("ECProduct");
  const ECCartItem = mongoose.model("ECCartItem");

  const product = await ECProduct.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // Check if cart has items and validate product type matches
  if (this.items.length > 0) {
    // Get the first item in the cart to determine the type
    const firstCartItem = await ECCartItem.findById(this.items[0]);
    const firstProductType = firstCartItem.productType;
    const newProductType = product.__t || "ECProduct";

    if (newProductType !== firstProductType) {
      throw new Error(`Cannot add item of type ${newProductType} to cart containing ${firstProductType} items. All items in cart must be of the same type.`);
    }
  }

  let cartItem = await ECCartItem.findOne({
    cart: this._id,
    product: productId,
  });

  if (cartItem) {
    cartItem.quantity = (cartItem.quantity || 1) + 1;
    cartItem.finalPrice = cartItem.priceAtAdd * cartItem.quantity;
    await cartItem.save();

    await this.updateTotals();
    return cartItem;
  }

  // Create new cart item with quantity fixed to 1 and product snapshot
  const price = product.priceAfterDiscount || product.price;
  cartItem = await ECCartItem.create({
    cart: this._id,
    product: productId,
    quantity: 1, // Fixed quantity of 1
    productType: product.__t || "ECProduct",
    priceAtAdd: price,
    finalPrice: price, // Since quantity is always 1, finalPrice equals priceAtAdd
    productSnapshot: {
      title: product.title,
      thumbnail: product.thumbnail,
      section: product.section,
      serial: product.serial,
      originalPrice: product.price,
      priceAfterDiscount: product.priceAfterDiscount,
    },
  });
  this.items.push(cartItem._id);

  // Update cart totals
  await this.updateTotals();
  return cartItem;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function (cartItemId) {
  const ECCartItem = mongoose.model("ECCartItem");

  // Remove the item
  await ECCartItem.findByIdAndDelete(cartItemId);

  // Remove from items array
  this.items = this.items.filter(
    (item) => item.toString() !== cartItemId.toString()
  );

  // Update cart totals
  await this.updateTotals();
};

// Method to clear cart
cartSchema.methods.clear = async function () {
  const ECCartItem = mongoose.model("ECCartItem");

  // Delete all cart items
  await ECCartItem.deleteMany({ cart: this._id });

  // Reset cart
  this.items = [];
  this.couponCode = null;
  this.subtotal = 0;
  this.discount = 0;
  this.total = 0;

  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function (couponId) {
  this.couponCode = couponId;
  await this.updateTotals();
};

// Method to check if cart has books
cartSchema.methods.hasBooks = async function () {
  await this.populate({
    path: "items",
    populate: { path: "product" },
  });

  return this.items.some((item) => item.productType === "ECBook");
};

// Get required fields for checkout based on cart contents
cartSchema.methods.getRequiredCheckoutFields = async function () {
  if (!this.populated("items")) {
    await this.populate("items");
  }

  const hasBooks = this.items.some((item) => item.productType === "ECBook");

  return {
    requiresBookDetails: hasBooks,
    requiredFields: {
      common: ["numberTransferredFrom", "paymentScreenShot"],
      books: hasBooks ? ["nameOnBook", "numberOnBook", "seriesName"] : [],
    },
  };
};

// Convert cart to purchases
cartSchema.methods.convertToPurchases = async function (checkoutData) {
  const ECPurchase = mongoose.model("ECPurchase");
  const ECBookPurchase = mongoose.model("ECBookPurchase");
  const purchases = [];

  // Validate common fields
  if (!checkoutData.numberTransferredFrom || !checkoutData.paymentScreenShot) {
    throw new Error("Missing required payment information");
  }

  // Group items by type
  const bookItems = this.items.filter((item) => item.productType === "ECBook");
  const productItems = this.items.filter(
    (item) => item.productType === "ECProduct"
  );

  // Process book purchases
  if (bookItems.length > 0) {
    if (
      !checkoutData.nameOnBook ||
      !checkoutData.numberOnBook ||
      !checkoutData.seriesName
    ) {
      throw new Error("Missing required book details");
    }

    for (const item of bookItems) {
      const purchase = await ECBookPurchase.create({
        userName: this.user.name,
        productName: item.productSnapshot.title,
        productId: item.product,
        price: item.priceAtAdd,
        finalPrice: item.finalPrice,
        numberTransferredFrom: checkoutData.numberTransferredFrom,
        paymentNumber: item.productSnapshot.paymentNumber,
        purchaseSerial: `${this.user.userSerial}-${item.productSnapshot.section.number}-${item.productSnapshot.serial}`,
        createdBy: this.user._id,
        paymentScreenShot: checkoutData.paymentScreenShot,
        nameOnBook: checkoutData.nameOnBook,
        numberOnBook: checkoutData.numberOnBook,
        seriesName: checkoutData.seriesName,
        couponCode: this.couponCode,
      });
      purchases.push(purchase);
    }
  }

  // Process regular product purchases
  for (const item of productItems) {
    const purchase = await ECPurchase.create({
      userName: this.user.name,
      productName: item.productSnapshot.title,
      productId: item.product,
      price: item.priceAtAdd,
      finalPrice: item.finalPrice,
      numberTransferredFrom: checkoutData.numberTransferredFrom,
      paymentNumber: item.productSnapshot.paymentNumber,
      purchaseSerial: `${this.user.userSerial}-${item.productSnapshot.section.number}-${item.productSnapshot.serial}`,
      createdBy: this.user._id,
      paymentScreenShot: checkoutData.paymentScreenShot,
      couponCode: this.couponCode,
    });
    purchases.push(purchase);
  }

  return purchases;
};

// Method to complete purchase and mark coupon as used
cartSchema.methods.completePurchase = async function (purchases) {
  // Mark coupon as used if present
  if (this.couponCode) {
    const ECCoupon = mongoose.model("ECCoupon");
    const coupon = await ECCoupon.findById(this.couponCode);
    if (coupon && coupon.isActive) {
      // Mark coupon as used with the first purchase
      await coupon.markAsUsed(purchases[0]._id, this.user);
    }
  }

  // Clear the cart
  await this.clear();

  this.status = "completed";
  return this.save();
};

const ECCart = mongoose.model("ECCart", cartSchema);
module.exports = ECCart;
