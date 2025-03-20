const mongoose = require('mongoose');
const User = require('./userModel');

const studentSchema = new mongoose.Schema({
  sequencedId: { type: Number, unique: true, required: true },
  level: { type: String, enum: User.levels, required: true, lowercase: true },
  hobbies: [String],
  parentPhoneNumber: String,
  faction: String,
  phoneNumber: { type: String, required: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }
}, {
  timestamps: true
});

const Student = User.discriminator('Student', studentSchema);

module.exports = Student;
