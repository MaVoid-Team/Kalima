const mongoose = require("mongoose");

const lecturerExamConfigSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    googleSheetId: {
      type: String,
      required: true,
    },
    studentIdentifierColumn: {
      type: String,
      required: true,
      default: "Email Address", // Default column name in Google Forms
    },
    scoreColumn: {
      type: String,
      required: true,
      default: "Score", // Default column name for score
    },
    defaultPassingThreshold: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 60, // Default passing threshold at 60%
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    formUrl: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LecturerExamConfig", lecturerExamConfigSchema);