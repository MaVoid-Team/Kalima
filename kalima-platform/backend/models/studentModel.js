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
    // General points balance
    generalPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    // Flag for tracking if a promo code has been used
    hasPromoCode: {
      type: Boolean,
      default: false
    },
    // Track if the promo code has been used for a purchase
    hasUsedPromoCode: {
      type: Boolean,
      default: false
    },
    // Track promo code points separately
    promoPoints: {
      type: Number,
      default: 0
    },
    government: { type: String, required: true },
    administrationZone: { type: String, required: true },
  },

  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);
// studentSchema.virtual("purchases", {
//   ref: "Purchase",
//   localField: "_id",
//   foreignField: "student",
// });
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

// Pre-validate hook to ensure the selected zone belongs to the selected government
studentSchema.pre("validate", async function (next) {
  if (this.government && this.zone) {
    const Government = require("./governmentModel");
    const gov = await Government.findOne({ name: this.government });
    if (!gov) {
      this.invalidate("government", "Selected government does not exist.");
    } else if (!gov.administrationZone.includes(this.administrationZone)) {
      this.invalidate(
        "zone",
        "Selected zone does not belong to the selected government."
      );
    }
  }
  next();
});

// A plugin to easily increment a field.
studentSchema.plugin(mongooseSequence, {
  inc_field: "sequencedId",
  startAt: 1000000,
});

const Student = User.discriminator("Student", studentSchema);

module.exports = Student;
