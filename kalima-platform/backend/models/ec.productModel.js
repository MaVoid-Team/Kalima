// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store product model.
const { required } = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    serial: { type: String, required: true },
    thumbnail: { type: String, required: true }, // Store local file path for product image
    sample: { type: String }, // Store local file path for sample PDF
    gallery: [
      {
        type: String,
      },
    ], // Array of local file paths for gallery images
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECSection",
      required: true,
    },
    price: { type: Number, required: true },
    paymentNumber: { type: String, required: true },
    discountPercentage: { type: Number },
    priceAfterDiscount: { type: Number },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    whatsAppNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECSubsection",
      required: [true, "Subsection is required"],
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

// Middleware to calculate discountPercentage from price and priceAfterDiscount
productSchema.pre("save", function (next) {
  this.calculateDiscount();
  next();
});

// Calculate discount helper
productSchema.methods.calculateDiscount = function () {
  if (this.price && this.priceAfterDiscount !== undefined && this.price !== 0) {
    this.discountPercentage = Math.round(
      ((this.price - this.priceAfterDiscount) / this.price) * 100,
    );
  } else {
    this.discountPercentage = 0;
  }
};

// Handle updates with pre-hook
productSchema.pre(
  /^findOneAndUpdate|^findByIdAndUpdate|^updateOne|^updateMany/,
  async function (next) {
    const update = this.getUpdate();
    const updateObj = update.$set || update;

    // Always calculate discount if price or priceAfterDiscount exists in update
    if (
      updateObj.price !== undefined ||
      updateObj.priceAfterDiscount !== undefined
    ) {
      try {
        const doc = await this.model.findOne(this.getQuery());

        if (!doc) {
          // Try with filter as ID for findByIdAndUpdate
          const filterId = this.getFilter()._id;
          if (filterId) {
            const docById = await this.model.findById(filterId);
            if (docById) {
              const finalPrice =
                updateObj.price !== undefined ? updateObj.price : docById.price;
              const finalPriceAfterDiscount =
                updateObj.priceAfterDiscount !== undefined
                  ? updateObj.priceAfterDiscount
                  : docById.priceAfterDiscount;

              let discount = 0;
              if (
                finalPrice &&
                finalPriceAfterDiscount !== undefined &&
                finalPrice !== 0
              ) {
                discount = Math.round(
                  ((finalPrice - finalPriceAfterDiscount) / finalPrice) * 100,
                );
              }

              if (update.$set) {
                update.$set.discountPercentage = discount;
              } else {
                update.discountPercentage = discount;
              }
            }
          }
        } else {
          const finalPrice =
            updateObj.price !== undefined ? updateObj.price : doc.price;
          const finalPriceAfterDiscount =
            updateObj.priceAfterDiscount !== undefined
              ? updateObj.priceAfterDiscount
              : doc.priceAfterDiscount;

          let discount = 0;
          if (
            finalPrice &&
            finalPriceAfterDiscount !== undefined &&
            finalPrice !== 0
          ) {
            discount = Math.round(
              ((finalPrice - finalPriceAfterDiscount) / finalPrice) * 100,
            );
          }

          if (update.$set) {
            update.$set.discountPercentage = discount;
          } else {
            update.discountPercentage = discount;
          }
        }
      } catch (error) {
        console.error("Error in discount calculation middleware:", error);
      }
    }
    next();
  },
);

module.exports = mongoose.model("ECProduct", productSchema);
