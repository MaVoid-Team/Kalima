// validations/subAdminValidation.js
const Joi = require("joi");

module.exports = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .min(8)
    .required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required'
    }),

  gender: Joi.string()
  .valid("male", "female")
  .required(),

  role: Joi.string()
  .valid("moderator")
  .required(),

});
