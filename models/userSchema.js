const { Schema, model } = require("mongoose");


const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phoneNumber: { type: String },
    address: {
        type: String,
    },
    avatar: { type: String },
    role: {
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user"
    }
}, { timestamps: true })


const UserModel = model('User', UserSchema);
module.exports = UserModel