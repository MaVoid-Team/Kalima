const mongoose = require("mongoose");

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  pointsAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  isRedeemed: {
    type: Boolean,
    default: false,
  },
  redeemedAt: {
    type: Date,
    default: null,
  },
});

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
