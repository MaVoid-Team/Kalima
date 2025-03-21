const mongoose = require('mongoose');
const User = require('./userModel');

const teacherPointsSchema = new mongoose.Schema({
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
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
  // Array of teacher-specific point balances
  teacherPoints: [teacherPointsSchema]
}, {
  timestamps: true
});

// Helper method to get points balance for a specific teacher
parentSchema.methods.getTeacherPointsBalance = function(teacherId) {
  const teacherPointsEntry = this.teacherPoints.find(
    entry => entry.teacher.toString() === teacherId.toString()
  );
  return teacherPointsEntry ? teacherPointsEntry.points : 0;
};

// Helper method to add points for a specific teacher
parentSchema.methods.addTeacherPoints = function(teacherId, pointsToAdd) {
  const teacherPointsEntry = this.teacherPoints.find(
    entry => entry.teacher.toString() === teacherId.toString()
  );
  
  if (teacherPointsEntry) {
    teacherPointsEntry.points += pointsToAdd;
  } else {
    this.teacherPoints.push({ teacher: teacherId, points: pointsToAdd });
  }
};

// Helper method to use points for a specific teacher
parentSchema.methods.useTeacherPoints = function(teacherId, pointsToUse) {
  const teacherPointsEntry = this.teacherPoints.find(
    entry => entry.teacher.toString() === teacherId.toString()
  );
  
  if (!teacherPointsEntry || teacherPointsEntry.points < pointsToUse) {
    return false; // Not enough points
  }
  
  teacherPointsEntry.points -= pointsToUse;
  return true; // Successfully used points
};

const Parent = User.discriminator('Parent', parentSchema);

module.exports = Parent;