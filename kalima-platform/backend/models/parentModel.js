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
  lecturerPoints: [lecturerPointsSchema]
}, {
  timestamps: true
});

// Helper method to get points balance for a specific lecturer
parentSchema.methods.getLecturerPointsBalance = function(lecturerId) {
  const lecturerPointsEntry = this.lecturerPoints.find(
    entry => entry.lecturer.toString() === lecturerId.toString()
  );
  return lecturerPointsEntry ? lecturerPointsEntry.points : 0;
};

// Helper method to add points for a specific lecturer
parentSchema.methods.addLecturerPoints = function(lecturerId, pointsToAdd) {
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
parentSchema.methods.useLecturerPoints = function(lecturerId, pointsToUse) {
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

const Parent = User.discriminator('Parent', parentSchema);

module.exports = Parent;