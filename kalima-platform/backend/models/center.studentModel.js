const mongoose = require("mongoose");
const mongooseSequence = require("mongoose-sequence")(mongoose);

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

// Add sequenced ID plugin
cStudentSchema.plugin(mongooseSequence, {
  inc_field: "sequencedId",
  startAt: 4000000, // Starting at 4 million to differentiate from regular student IDs
});

module.exports = mongoose.model("cStudent", cStudentSchema);
