const { googleVerifyToken } = require("../middlewares/googleAuth")
const { request, response } = require('express');
const { badRequestResponse, successResponse, errorResponse, notFoundResponse } = require("../helpers/apiResponse");
const UserModel = require("../models/userSchema");
const { hash, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const WalletModel = require("../models/WalletSchema");
const { createUserWithWallet } = require("../services/walletService");
const { getAcctNumberFromPhone } = require("../helpers/getAcctNumberFromPhone");


const generateOTP = () => {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
};

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.googleVerify = async (req, res) => {
    try {
        const payload = await googleVerifyToken(req.body.token);
        if (payload) {
            // token is valid
            console.log(payload);
            res.json({ user: payload });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying google token ', error);;
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.register = async (req, res) => {
    const { email, password, phoneNumber, firstName, lastName, address } = req.body;

    let validAcctNumber;
    try {
        validAcctNumber = getAcctNumberFromPhone(phoneNumber);
    } catch (error) {
        return badRequestResponse(res, error.message);
    }

    try {
        // check if email or phone number already exists
        const existingEmail = await UserModel.findOne({ email });
        const existingPhone = await UserModel.findOne({ phoneNumber });
        if (existingEmail) return badRequestResponse(res, 'Email already exist.')
        if (existingPhone) return badRequestResponse(res, 'Phone number already exists.');

        // hash password
        const passwordHash = await hash(password, 10);

        const result = await createUserWithWallet({
            email, firstName, lastName, password: passwordHash, phoneNumber, address
        }, validAcctNumber)

        successResponse(res, { ...result, password: '', });
    } catch (error) {
        console.log(error)
        errorResponse(res, error?.message);
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) return badRequestResponse(res, 'email and password is required');

        const user = await UserModel.findOne({ email });
        if (!user) return notFoundResponse(res, 'user with this email not found');

        const passwordIsValid = compare(password, user.password);
        if (!passwordIsValid) return badRequestResponse(res, 'password does not match this email');

        const token = sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3d' })

        successResponse(res, { user: { ...user.toObject(), password: '' }, token });
    } catch (error) {
        errorResponse(res, error)
    }
}

