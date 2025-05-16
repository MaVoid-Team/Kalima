const Joi = require("joi");
const userValidation = require("./userValidation.js");

const teacherValidation = userValidation.concat(
  Joi.object({
    role: Joi.string().valid("teacher").required(),
    faction: Joi.string().optional(),
    phoneNumber: Joi.string().required(),
    subject: Joi.string().required(),
    level: Joi.string().valid("primary", "preparatory", "secondary").required(),
    teachesAtType: Joi.string().valid("Center", "School", "Both").required(),
    centers: Joi.array()
      .items(Joi.string())
      .when("teachesAtType", {
        is: Joi.valid("Center", "Both"),
        then: Joi.array().min(1).required(),
        otherwise: Joi.optional(),
      }),
    school: Joi.string().when("teachesAtType", {
      is: Joi.valid("School", "Both"),
      then: Joi.string().min(1).required(),
      otherwise: Joi.optional(),
    }),
    socialMedia: Joi.array()
      .items(
        Joi.object({
          platform: Joi.string()
            .valid(
              "Facebook",
              "Instagram",
              "Twitter",
              "LinkedIn",
              "TikTok",
              "YouTube",
              "WhatsApp",
              "Telegram"
            )
            .optional(),
          account: Joi.string().optional(),
        })
      )
      .optional(),
  })
);

module.exports = teacherValidation;
