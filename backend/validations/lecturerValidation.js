const Joi = require('joi')
const userValidation = require('./userValidation.js')

const lecturerValidation = userValidation.concat(
  Joi.object({
    bio: Joi.string().required(),
    expertise: Joi.string().required(),
  })
)

module.exports = lecturerValidation
