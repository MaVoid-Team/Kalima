const mongoose = require("mongoose");

const studentExamSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
    passingThreshold: {
      type: Number,
      required: true,
      min: 0,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// For efficiently finding all submissions for a lecture
studentExamSubmissionSchema.index({ lecture: 1, submittedAt: -1 });

module.exports = mongoose.model("StudentExamSubmission", studentExamSubmissionSchema);