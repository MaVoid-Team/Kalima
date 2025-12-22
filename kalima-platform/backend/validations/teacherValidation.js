const Joi = require("joi");
const userValidation = require("./userValidation.js");

const teacherValidation = userValidation.concat(
  Joi.object({
    role: Joi.string()
      .custom((value, helpers) => {
        if (typeof value === "string" && value.toLowerCase() === "teacher") {
          return "teacher";
        }
        return helpers.error("any.only", { value });
      })
      .required()
      .messages({
        "any.only": 'Role must be "teacher"',
      }),

    faction: Joi.string().optional(),

    phoneNumber: Joi.string().required(),
    phoneNumber2: Joi.string().allow(null, "").optional(),

    subject: Joi.string().optional(),

    level: Joi.array()
      .items(Joi.string().valid("primary", "preparatory", "secondary"))
      .optional(),

    teachesAtType: Joi.string()
      .valid("Center", "School", "Both", "")
      .optional(),

    centers: Joi.array()
      .items(Joi.string())
      .optional(),

    school: Joi.string().allow("").optional(),

    socialMedia: Joi.array()
      .items(
        Joi.object({
          platform: Joi.string().optional(),
          account: Joi.string().optional(),
        })
      )
      .optional(),

    government: Joi.string().required(),
    administrationZone: Joi.string().required(),

    referralSerial: Joi.string().allow("").optional(),

    preferredContactTime: Joi.object({
      from: Joi.string()
        .pattern(/^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
        .optional()
        .messages({
          "string.pattern.base": 'Time format must be HH:MM AM/PM (e.g., "08:00 AM")'
        }),
      to: Joi.string()
        .pattern(/^(0[0-9]|1[0-2]):[0-5][0-9] (AM|PM)$/)
        .optional()
        .messages({
          "string.pattern.base": 'Time format must be HH:MM AM/PM (e.g., "05:00 PM")'
        }),
      note: Joi.string().allow('', null).optional()
    }).unknown(true).optional()
  })
);

module.exports = teacherValidation;
