const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  lecturer: { type: String, required: true },
  level: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: false }, // Duration in minutes
  center: { type: mongoose.Schema.Types.ObjectId, ref: "Center", required: true }, // Reference to Center
}, {
  timestamps: true,
});

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;