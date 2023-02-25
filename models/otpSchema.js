const { Schema, model } = require("mongoose");


const OtpSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
    }
}, { timestamps: true });

const OtpModel = model('Otp', OtpSchema);
module.exports = OtpModel;