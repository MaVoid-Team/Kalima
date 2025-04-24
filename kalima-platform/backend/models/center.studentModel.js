const mongoose = require("mongoose");

const cStudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    parentPhoneNumber: {
      type: String,
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cStudent", cStudentSchema);
