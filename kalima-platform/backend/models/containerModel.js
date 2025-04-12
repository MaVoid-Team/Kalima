const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["year", "term", "month", "lecture", "course"],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    teacherAllowed: {
      type: Boolean,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Container",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Container" }],
    price: { type: Number, default: 0 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    discriminatorKey: "kind",
  }
);

module.exports = mongoose.model("Container", containerSchema);
