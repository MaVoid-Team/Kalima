const Joi = require("joi");
const userValidation = require("./userValidation.js");

const parentValidation = userValidation.concat(
  Joi.object({
    children: Joi.array(),
    views: Joi.number().integer().min(0).default(0),
    phoneNumber: Joi.string().required(),
    level: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        "string.pattern.base": "level must be a valid MongoDB ObjectId.",
      }),
    government: Joi.string().required(),
    administrationZone: Joi.string().required(),
    referralSerial: Joi.string().optional(), // Allow referralSerial

    preferredContactTime: Joi.object({
      from: Joi.string()
        .pattern(/^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
        .optional()
        .messages({
          "string.pattern.base":
            'Time format must be HH:MM AM/PM (e.g., "08:00 AM")',
        }),
      to: Joi.string()
        .pattern(/^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
        .optional()
        .messages({
          "string.pattern.base":
            'Time format must be HH:MM AM/PM (e.g., "05:00 PM")',
        }),
      note: Joi.string().allow("", null).optional(),
    })
      .unknown(true)
      .optional(),
  })
);

module.exports = parentValidation;
