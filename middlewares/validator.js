const Joi = require('joi');
const JoiWithPhone = Joi.extend(require('joi-phone-number'));


exports.RegisterSchema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string(),
    address: Joi.string(),
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    })
})

exports.OTPGenerateSchema = Joi.object({
    phoneNumber: JoiWithPhone.string().phoneNumber({
        defaultCountry: 'NG',
        format: 'e164',
        strict: true
    })
})

exports.CreatePinSchema = Joi.object({
    pin: Joi.string().min(4).max(4).required(),
    retryPin: Joi.ref('pin')
})

exports.ChangePinSchema = Joi.object({
    oldPin: Joi.string().min(4).max(4).required(),
    newPin: Joi.string().min(4).max(4).required(),
    retryNewPin: Joi.ref('newPin')
})