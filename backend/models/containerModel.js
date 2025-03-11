const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["year", "term", "month", "lecture"],
      required: true,
    },
    level: {
      type: String,
      enum: ["primary", "secondary", "high"],
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Container" }],
    price: { type: Number, default: 0 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Container", containerSchema);
