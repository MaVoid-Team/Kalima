const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  city: String,
  governorate: String,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    email: { type: String, unique: true, required: true },
    address: addressSchema,
    referralSource: String,
    password: { type: String, required: true }, // Added password field
  },
  {
    discriminatorKey: "role", // Sets the name of the discriminator identifier filed.
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);


// For setting up available grades.

User.levels = ["Grade 4", "Grade 5", "grade 6", "First Preparatory", "Second Preparatory", "Third Preparatory", "First Secondary",
  "Second Secondary", "Third Secondary"]

module.exports = User;
