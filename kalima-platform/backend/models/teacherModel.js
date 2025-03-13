const mongoose = require('mongoose');
const User = require('./userModel');

const teacherSchema = new mongoose.Schema({
  faction: String,
  phoneNumber: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: String, enum: User.levels, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, {
  timestamps: true
});

const Teacher = User.discriminator('Teacher', teacherSchema);

module.exports = Teacher;
