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
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  redeemedAt: {
    type: Date,
    default: null,
  },
});

codeSchema.indexes({ code: 1 });

codeSchema.methods.generateCode = function () {
  const objectIdHex = this._id.toString();
  const base36 = BigInt("0x" + objectIdHex)
    .toString(36)
    .toUpperCase();
  this.code = base36;
};

const Code = mongoose.model("Code", codeSchema);
module.exports = Code;
