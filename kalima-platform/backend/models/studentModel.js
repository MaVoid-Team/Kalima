const mongoose = require("mongoose");
const User = require("./userModel");
const mongooseSequence = require("mongoose-sequence")(mongoose);

const lecturerPointsSchema = new mongoose.Schema(
  {
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Level",
      required: true,
    },
    hobbies: [String],
    parentPhoneNumber: String,
    faction: String,
    phoneNumber: { type: String, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
    // Array of lecturer-specific point balances
    lecturerPoints: [lecturerPointsSchema],
  totalPoints: {
    type: Number,
    default:0
  },,
  },
  
{
    timestamps: true,
  }
);

// Helper method to get points balance for a specific lecturer
studentSchema.methods.getLecturerPointsBalance = function (lecturerId) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    (entry) => entry.lecturer.toString() === lecturerId.toString()
  );
  return lecturerPointsEntry ? lecturerPointsEntry.points : 0;
};

// Helper method to add points for a specific lecturer
studentSchema.methods.addLecturerPoints = function (lecturerId, pointsToAdd) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    (entry) => entry.lecturer.toString() === lecturerId.toString()
  );

  if (lecturerPointsEntry) {
    lecturerPointsEntry.points += pointsToAdd;
  } else {
    this.lecturerPoints.push({ lecturer: lecturerId, points: pointsToAdd });
  }
};

// Helper method to use points for a specific lecturer
studentSchema.methods.useLecturerPoints = function (lecturerId, pointsToUse) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    (entry) => entry.lecturer.toString() === lecturerId.toString()
  );

  if (!lecturerPointsEntry || lecturerPointsEntry.points < pointsToUse) {
    return false; // Not enough points
  }

  lecturerPointsEntry.points -= pointsToUse;
  return true; // Successfully used points
};

// A plugin to easily increment a field.
studentSchema.plugin(mongooseSequence, {
  inc_field: "sequencedId",
  startAt: 1000000,
});

const Student = User.discriminator("Student", studentSchema);

module.exports = Student;
