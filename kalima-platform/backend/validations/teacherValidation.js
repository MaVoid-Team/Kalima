const Joi = require('joi')
const userValidation = require('./userValidation.js')
levels = userValidation.levels

const teacherValidation = userValidation.concat(
  Joi.object({
    role: Joi.string().valid("teacher").required(),
    faction: Joi.string().optional(),
    phoneNumber: Joi.string().required(),
    subject: Joi.string().required(),
    level: Joi.string().valid(...levels).insensitive().required(),
    school: Joi.string().hex().length(24).optional()
  })
)

module.exports = teacherValidation
