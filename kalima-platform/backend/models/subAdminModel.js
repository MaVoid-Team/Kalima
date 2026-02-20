// DOMAIN: ACADEMY
// STATUS: LEGACY
// NOTE: Academy sub-admin model.
const mongoose = require("mongoose");
const User = require("./userModel");

const subAdminSchema = new mongoose.Schema(
  {
    monthlyConfirmedCount: { type: Number, default: 0 },
    lastConfirmedCountUpdate: { type: Date },
  },
  {
    timestamps: true,
  },
);

const SubAdmin = User.discriminator("SubAdmin", subAdminSchema);

module.exports = SubAdmin;
