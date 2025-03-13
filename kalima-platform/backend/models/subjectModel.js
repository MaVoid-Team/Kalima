const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter subject name"],
      trim: true,
      unique: true,
    },

    level: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Level",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Subject", subjectSchema);
