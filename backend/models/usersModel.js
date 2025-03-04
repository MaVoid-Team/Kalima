const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  city: String,
  governorate: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  email: { type: String, unique: true, required: true },
  address: addressSchema,
  referralSource: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;