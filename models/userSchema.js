const { Schema, model } = require("mongoose");


const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phoneNumber: { type: String },
    gender: {
        type: String,
        enum: ['male', 'female'],
    },
    avatar: { type: String }
}, { timestamps: true })


const UserModel = model('User', UserSchema);
module.exports = UserModel