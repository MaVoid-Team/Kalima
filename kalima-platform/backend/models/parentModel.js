const mongoose = require('mongoose');
const User = require('./userModel');

const lecturerPointsSchema = new mongoose.Schema({
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecturer',
    required: true
  },
  points: {
    type: Number,
    default: 0
  }
}, { _id: false });

const parentSchema = new mongoose.Schema({
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  views: { type: Number, default: 0 },
  phoneNumber: { type: String, required: true },
  level: { type: String, enum: User.levels, lowercase: true },
  // Array of lecturer-specific point balances
  lecturerPoints: [lecturerPointsSchema],
  government: { type: String, required: true },
  administrationZone: { type: String, required: true },
    userSeria: {
    type: String,
    unique: true,
    index: true
  },
}, {
  timestamps: true
});

// Helper method to get points balance for a specific lecturer
parentSchema.methods.getLecturerPointsBalance = function (lecturerId) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    entry => entry.lecturer.toString() === lecturerId.toString()
  );
  return lecturerPointsEntry ? lecturerPointsEntry.points : 0;
};

// Helper method to add points for a specific lecturer
parentSchema.methods.addLecturerPoints = function (lecturerId, pointsToAdd) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    entry => entry.lecturer.toString() === lecturerId.toString()
  );

  if (lecturerPointsEntry) {
    lecturerPointsEntry.points += pointsToAdd;
  } else {
    this.lecturerPoints.push({ lecturer: lecturerId, points: pointsToAdd });
  }
};

// Helper method to use points for a specific lecturer
parentSchema.methods.useLecturerPoints = function (lecturerId, pointsToUse) {
  // Special case - if trying to deduct 0 points, always succeed
  if (pointsToUse === 0) {
    return true;
  }

  const lecturerPointsEntry = this.lecturerPoints.find(
    entry => entry.lecturer.toString() === lecturerId.toString()
  );

  if (!lecturerPointsEntry || lecturerPointsEntry.points < pointsToUse) {
    return false; // Not enough points
  }

  lecturerPointsEntry.points -= pointsToUse;
  return true; // Successfully used points
};

parentSchema.pre('save', async function(next) {
  if (this.isNew && !this.userSeria) {
    try {
      // Get the count of existing parents to generate next number
      const count = await mongoose.model('Parent').countDocuments();
      // Generate userSeria with format PA + 3-digit number (PA001, PA002, etc.)
      this.userSeria = `PA${String(count + 1).padStart(3, '0')}`;
      
      // Check if this userSeria already exists (for race condition safety)
      const existingParent = await mongoose.model('Parent').findOne({ userSeria: this.userSeria });
      if (existingParent) {
        // If it exists, find the highest number and increment
        const allParents = await mongoose.model('Parent').find({}, 'userSeria').lean();
        const numbers = allParents
          .map(p => parseInt(p.userSeria.replace('PA', '')))
          .filter(n => !isNaN(n));
        
        const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        this.userSeria = `PA${String(maxNumber + 1).padStart(3, '0')}`;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});


parentSchema.pre("validate", async function (next) {
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

const Parent = User.discriminator('Parent', parentSchema);

module.exports = Parent;