const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter section name"],
      trim: true,
    },
    number: {
      type: Number,
      required: [true, "Please enter section number"],
      unique: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Please provide a thumbnail URL"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual populate for products
sectionSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "section",
});

sectionSchema.set("toObject", { virtuals: true });
sectionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("ECSection", sectionSchema);
