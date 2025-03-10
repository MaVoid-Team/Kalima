const Joi = require('joi')
const userValidation = require('./userValidation.js')

const studentValidation = userValidation.concat(
  Joi.object({
    sequencedId: Joi.number().integer().required(),
    classLevel: Joi.string().required(),
    hobbies: Joi.array().items(Joi.string()).optional(),
    parentPhoneNumber: Joi.string().optional(),
    studentPhoneNumber: Joi.string().optional(),
    faction: Joi.string().optional(),
    school: Joi.string().hex().length(24).optional(),
    parent: Joi.string().hex().length(24).optional(),
  })
)

module.exports = studentValidation
