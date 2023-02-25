const { Schema, model } = require("mongoose");


const UserSchema = new Schema({
    firstName: { type: String, },
    lastName: { type: String, },
    email: { type: String,  unique: true },
    password: { type: String, },

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