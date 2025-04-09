const Joi = require("joi");
const userValidation = require("./userValidation.js");

const teacherValidation = userValidation.concat(
  Joi.object({
    role: Joi.string().valid("teacher").required(),
    faction: Joi.string().optional(),
    phoneNumber: Joi.string().required(),
    subject: Joi.string().required(),
    level: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "level must be a valid MongoDB ObjectId.",
      }),
    school: Joi.string().hex().length(24).optional(),
  })
);

module.exports = teacherValidation;
