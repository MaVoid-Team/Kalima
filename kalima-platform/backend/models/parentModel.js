const mongoose = require('mongoose');
const User = require('./userModel');

const parentSchema = new mongoose.Schema({
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  views: { type: Number, default: 0 },
  phoneNumber: { type: String, required: true },
  level: { type: String, enum: User.levels, lowercase: true },
}, {
  timestamps: true
});

const Parent = User.discriminator('Parent', parentSchema);

module.exports = Parent;
