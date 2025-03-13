// A base user schema used to concat other members schemas.
const Joi = require("joi");

const userValidation = Joi.object({
  name: Joi.string().trim().required(),
  gender: Joi.string().valid("male", "female").required(), // Please add more to not get canceled on twitter.
  email: Joi.string().email().required(),
  address: Joi.object({
    city: Joi.string().required(),
    governorate: Joi.string().required(),
  }),
  referralSource: Joi.string().optional(),
  password: Joi.string().min(6).required(),
  role: Joi.string().required()
});

// For setting up available grades so my fingers don't work too hard.

userValidation.levels = ["Grade 4", "Grade 5", "grade 6", "First Preparatory", "Second Preparatory", "Third Preparatory", "First Secondary",
  "Second Secondary", "Third Secondary"]

module.exports = userValidation
