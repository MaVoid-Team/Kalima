const mongoose = require('mongoose');
const User = require('./userModel');

const lecturerSchema = new mongoose.Schema({
  bio: { type: String, required: true },
  expertise: { type: String, required: true },
  profilePicture: {
    url: String,
    publicId: String,
  },
}, {
  timestamps: true
});

const Lecturer = User.discriminator('Lecturer', lecturerSchema);

module.exports = Lecturer;