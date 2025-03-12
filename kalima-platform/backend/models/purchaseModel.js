const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  container: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Container",
    required: true,
  },
  purchasedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
