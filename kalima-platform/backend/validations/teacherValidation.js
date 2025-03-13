const Joi = require('joi')
const userValidation = require('./userValidation.js')

const teacherValidation = userValidation.concat(
  Joi.object({
    role: Joi.string().valid("teacher").required(),
    faction: Joi.string().optional(),
    phoneNumber: Joi.string(),
    subject: Joi.string().required(),
    level: Joi.string().required(),
    school: Joi.string().hex().length(24).optional()
  })
)

module.exports = teacherValidation
