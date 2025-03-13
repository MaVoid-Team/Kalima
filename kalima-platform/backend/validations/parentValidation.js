const Joi = require('joi')
const userValidation = require('./userValidation.js')

const parentValidation = userValidation.concat(
  Joi.object({
    children: Joi.array(),
    views: Joi.number().integer().min(0).default(0),
    phoneNumber: Joi.string().required(),
    classLevel: Joi.string().optional(),
  })
)

module.exports = parentValidation
