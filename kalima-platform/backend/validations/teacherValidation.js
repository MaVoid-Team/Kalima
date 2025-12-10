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
  })
);

module.exports = teacherValidation;
