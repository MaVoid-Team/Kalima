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
    level: [
      {
        type: String,
        enum: ["primary", "preparatory", "secondary"],
        required: true,
      },
    ],
    socialMedia: [
      {
        platform: {
          type: String,
          enum: [
            "Facebook",
            "Instagram",
            "Twitter",
            "LinkedIn",
            "TikTok",
            "YouTube",
            "WhatsApp",
            "Telegram",
          ],
          required: false,
        },
        account: {
          type: String,
          required: false,
        },
      },
    ],

    teachesAtType: {
      type: String,
      enum: ["Center", "School", "Both"],
      required: true,
    },
    centers: [{ type: String }], // Array of strings for center names
    school: { type: String },
    lecturerPoints: [lecturerPointsSchema],
  },
  {
    timestamps: true,
  }
);

// Custom validation for conditional required fields
teacherSchema.pre("validate", function (next) {
  if (
    (this.teachesAtType === "Center" || this.teachesAtType === "Both") &&
    (!this.centers || this.centers.length === 0)
  ) {
    this.invalidate(
      "centers",
      "At least one center is required if teachesAtType is 'Center' or 'Both'."
    );
  }
  if (
    (this.teachesAtType === "School" || this.teachesAtType === "Both") &&
    (!this.school || this.school.trim() === "")
  ) {
    this.invalidate(
      "school",
      "School is required if teachesAtType is 'School' or 'Both'."
    );
  }
  next();
});

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
  // Special case - if trying to deduct 0 points, always succeed
  if (pointsToUse === 0) {
    return true;
  }

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
