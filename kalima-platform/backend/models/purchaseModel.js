const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  // Who purchased the points
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // For which lecturer these points are valid
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecturer",
    required: true,
  },
  // Points amount purchased or container purchased
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  // If this is a container purchase, reference it
  container: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Container",
    required: false,
  },
  code: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Code",
    required: false,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: false,
  },
  // Type of transaction: "pointPurchase" or "containerPurchase"
  type: {
    type: String,
    enum: ["pointPurchase", "containerPurchase", "packagePurchase"],
    required: true,
  },
  // Additional details
  description: {
    type: String,
    default: "Purchase",
  },
  // When the purchase was made
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
