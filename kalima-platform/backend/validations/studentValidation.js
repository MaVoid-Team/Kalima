const Joi = require('joi')
const userValidation = require('./userValidation.js')
levels = userValidation.levels

const studentValidation = userValidation.concat(
  Joi.object({
    sequencedId: Joi.number().integer().required(),
    level: Joi.string().valid(...levels).insensitive().required(),
    hobbies: Joi.array().items(Joi.string()).optional(),
    parentPhoneNumber: Joi.string().optional(),
    phoneNumber: Joi.string().required(),
    faction: Joi.string().optional(),
    school: Joi.string().hex().length(24).optional(),
    parent: Joi.string().hex().length(24).optional(),
  })
)

module.exports = studentValidation
