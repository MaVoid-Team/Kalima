const mongoose = require('mongoose');
const User = require('./userModel');

const studentSchema = new mongoose.Schema({
  sequencedId: { type: Number, unique: true, required: true },
  classLevel: { type: String, required: true },
  hobbies: [String],
  parentPhoneNumber: String,
  studentPhoneNumber: String,
  faction: String,
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }
}, {
  timestamps: true
});

const Student = User.discriminator('Student', studentSchema);

module.exports = Student;