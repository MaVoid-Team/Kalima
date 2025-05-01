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
  const objectIdHex = this._id.toString();
  const base36 = BigInt("0x" + objectIdHex)
    .toString(36)
    .toUpperCase();
  this.code = base36;
};

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
