// DOMAIN: ACADEMY
// STATUS: LEGACY
// NOTE: Academy admin model.
const mongoose = require("mongoose");
const User = require("./userModel");

const adminSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  },
);

const Admin = User.discriminator("Admin", adminSchema);

module.exports = Admin;
