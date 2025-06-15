const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    serial: { type: String, required: true },
    thumbnail: { type: String, required: true }, // Store Cloudinary URL for product image
    sample: { type: String }, // PDF file path or URL
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECSection",
      required: true,
    },
    price: { type: Number, required: true },
    paymentNumber: { type: String, required: true },
    discountPercentage: { type: Number, default: 0 },
    priceAfterDiscount: { type: Number },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Middleware to calculate priceAfterDiscount
function setPriceAfterDiscount(next) {
  // Always use 0 if undefined or null
  const price = typeof this.price === "number" ? this.price : 0;
  const discount =
    typeof this.discountPercentage === "number" ? this.discountPercentage : 0;
  this.priceAfterDiscount = price - (price * discount) / 100;
  next();
}
productSchema.pre("save", setPriceAfterDiscount);
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  // Support both direct and $set updates
  let price = update.price;
  let discount = update.discountPercentage;
  if (update.$set) {
    price = update.$set.price !== undefined ? update.$set.price : price;
    discount =
      update.$set.discountPercentage !== undefined
        ? update.$set.discountPercentage
        : discount;
  }
  // Fallback to current doc if not provided
  this.model.findOne(this.getQuery()).then((doc) => {
    const finalPrice = typeof price === "number" ? price : doc ? doc.price : 0;
    const finalDiscount =
      typeof discount === "number"
        ? discount
        : doc
          ? doc.discountPercentage
          : 0;
    update.priceAfterDiscount = finalPrice - (finalPrice * finalDiscount) / 100;
    if (update.$set) update.$set.priceAfterDiscount = update.priceAfterDiscount;
    this.setUpdate(update);
    next();
  });
});

module.exports = mongoose.model("Product", productSchema);
