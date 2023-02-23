const Joi = require('joi');


exports.RegisterSchema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string(),
    address: Joi.string(),
    phoneNumber: Joi.string().min(10).max(14)
})