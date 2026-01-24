const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECCart",
      required: [true, "Cart ID is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECProduct",
      required: [true, "Product ID is required"],
    },
    quantity: {
      type: Number,
      default: 1,
      required: true,
      min: 1,
    },
    productType: {
      type: String,
      enum: ["ECProduct", "ECBook"],
      required: [true, "Product type is required"],
    },
    priceAtAdd: {
      type: Number,
      required: [true, "Price at add is required"],
    },
    finalPrice: {
      type: Number,
      required: [true, "Final price is required"],
    },
    productSnapshot: {
      title: {
        type: String,
        required: true,
      },
      thumbnail: String,
      section: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      serial: String,
      originalPrice: {
        type: Number,
        required: true,
      },
      priceAfterDiscount: Number,
      paymentNumber: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

// Pre-save middleware to calculate finalPrice
cartItemSchema.pre("save", function (next) {
  this.finalPrice = this.priceAtAdd * this.quantity;
  next();
});

// Method to update finalPrice when quantity changes
cartItemSchema.methods.updatePrice = function () {
  this.finalPrice = this.priceAtAdd * this.quantity;
  return this.finalPrice;
};

const ECCartItem = mongoose.model("ECCartItem", cartItemSchema);
module.exports = ECCartItem;
