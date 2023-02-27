const { googleVerifyToken } = require("../middlewares/googleAuth")
const { request, response } = require('express');
const { badRequestResponse, successResponse, errorResponse, notFoundResponse } = require("../helpers/apiResponse");
const UserModel = require("../models/userSchema");
const { hash, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const WalletModel = require("../models/WalletSchema");
const { createUserWithWallet } = require("../services/walletService");
const { getAcctNumberFromPhone } = require("../helpers/getAcctNumberFromPhone");
const { generate } = require("otp-generator");
const { default: axios } = require("axios");
require('dotenv').config();


/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.generateOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const otp = generate(6, {digits: true, specialChars: false});
        const hashedOtp = await hash(otp, 10);

        // const apiUrl = process.env.TERMII_API_URL + '/sms/otp/send';
        const apiUrl = process.env.TERMII_API_URL + '/sms/send';
        // const payload = {
        //     api_key: process.env.TERMII_API_KEY,
        //     message_type: 'NUMERIC',
        //     to: phoneNumber,
        //     from: 'Venpay',
        //     channel: 'dnd',
        //     pin_attempts: 10,
        //     pin_time_to_live: 5,
        //     pin_length: 6,
        //     pin_placeholder: '< 1234 >',
        //     message_text: 'Your pin is < 1234 >',
        //     pin_type: 'NUMERIC'
        // };
        const payload = {
            "to": "+2348141971579",
            "from": "N-alert",
            "sms": `Hi Kingsley ${otp} is your verification code Venpay.`,
            "type": "plain",
            "channel": "dnd",
            "api_key": process.env.TERMII_API_KEY,
        }
        const { data } = await axios.post(apiUrl, payload);
        const { pinId, to, smsStatus } = data;
        if (smsStatus !== 'Message sent') return errorResponse(res, `Failed to send otp to ${phoneNumber}`)

        res.cookie('otpHash', hashedOtp, { httpOnly: true, maxAge: 90000 });
        res.cookie('phoneNumber', to, { httpOnly: true, maxAge: 90000 });
        res.cookie('pinId', pinId, { httpOnly: true, maxAge: 90000 });
        successResponse(res, { message: "Otp sent! Expires in 10mins." });
    } catch (error) {
        console.log(error);
        errorResponse(res, (error?.response?.data?.message ?? error.message), error?.response.status ?? 500);
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;
    try {
        const otpHash = req.cookies.otpHash;
        console.log(otpHash)
        const otpIsCorrect = await compare(otp, otpHash);
        if (!otpIsCorrect) return badRequestResponse(res, "Otp is invalid");

        successResponse(res, 'Otp verified successfully.')
    } catch (error) {
        errorResponse(res, error.message);
    }
}

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

