const mongoose = require('mongoose');
const User = require('./userModel');

const teacherSchema = new mongoose.Schema({
  faction: String,
  phoneNumber: String,
  subject: { type: String, required: true },
  level: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, {
  timestamps: true
});

const Teacher = User.discriminator('Teacher', teacherSchema);

module.exports = Teacher;