const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,  // This already creates an index
  },
  type: {
    type: String,
    enum: ["general", "specific", "promo"],
    required: true,
  },
  pointsAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecturer",
    required: [
      function () {
        return this.type === "specific";
      },
      "Lecturer ID is required for specific codes",
    ],
  },
  isRedeemed: {
    type: Boolean,
    default: false,
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  redeemedAt: {
    type: Date,
    default: null,
  }
});

codeSchema.methods.generateCode = function () {
  // Use the ObjectId as a seed for randomness
  const objectIdHex = this._id.toString();
  
  // Create a numeric string from the ObjectId to ensure uniqueness
  // We'll use the last 10 digits of a large number derived from the ObjectId
  const numericBase = BigInt("0x" + objectIdHex) % 10000000000n;
  let result = numericBase.toString().padStart(10, '0');
  
  // If the result is somehow shorter than 10 digits, pad with random numbers
  if (result.length < 10) {
    while (result.length < 10) {
      const randomDigit = Math.floor(Math.random() * 10);
      result += randomDigit.toString();
    }
  }
  
  // Ensure it's exactly 10 digits
  if (result.length > 10) {
    result = result.substring(0, 10);
  }
  
  this.code = result;
};

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
