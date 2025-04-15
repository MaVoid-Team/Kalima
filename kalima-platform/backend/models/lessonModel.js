const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CLecturer",
      required: true,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: false },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
