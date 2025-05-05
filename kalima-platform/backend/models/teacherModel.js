const mongoose = require("mongoose");
const User = require("./userModel");

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

const teacherSchema = new mongoose.Schema(
  {
    faction: String,
    phoneNumber: { type: String, required: true },
    subject: { type: String, required: true },
    level: { type: String, enum: User.levels, required: true, lowercase: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    lecturerPoints: [lecturerPointsSchema],
  },
  {
    timestamps: true,
  }
);
teacherSchema.methods.getLecturerPointsBalance = function (lecturerId) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    (entry) => entry.lecturer.toString() === lecturerId.toString()
  );
  return lecturerPointsEntry ? lecturerPointsEntry.points : 0;
};

// Helper method to add points for a specific lecturer
teacherSchema.methods.addLecturerPoints = function (lecturerId, pointsToAdd) {
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
teacherSchema.methods.useLecturerPoints = function (lecturerId, pointsToUse) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    (entry) => entry.lecturer.toString() === lecturerId.toString()
  );

  if (!lecturerPointsEntry || lecturerPointsEntry.points < pointsToUse) {
    return false; // Not enough points
  }

  lecturerPointsEntry.points -= pointsToUse;
  return true; // Successfully used points
};

const Teacher = User.discriminator("Teacher", teacherSchema);

module.exports = Teacher;
