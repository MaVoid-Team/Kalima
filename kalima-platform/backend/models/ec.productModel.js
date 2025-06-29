const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    serial: { type: String, required: true },
    thumbnail: { type: String, required: true }, // Store local file path for product image
    sample: { type: String }, // Store local file path for sample PDF
    gallery: [{
      type: String,
    }], // Array of local file paths for gallery images
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
    description: { type: String, required: [true, "Description is required"], trim: true },
    whatsAppNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
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
  // Ceil if there are decimals, else keep as is
  let val = price - (price * discount) / 100;
  this.priceAfterDiscount = (val % 1 === 0) ? val : Math.ceil(val);
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
    // Ceil if there are decimals, else keep as is
    let val = finalPrice - (finalPrice * finalDiscount) / 100;
    update.priceAfterDiscount = (val % 1 === 0) ? val : Math.ceil(val);
    if (update.$set) update.$set.priceAfterDiscount = update.priceAfterDiscount;
    this.setUpdate(update);
    next();
  });
});

module.exports = mongoose.model("Product", productSchema);
