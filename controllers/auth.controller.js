const { googleVerifyToken } = require("../middlewares/googleAuth")
const { request, response } = require('express');
const { badRequestResponse, successResponse, errorResponse, notFoundResponse, unauthorizedResponse } = require("../helpers/apiResponse");
const UserModel = require("../models/userSchema");
const { hash, compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const WalletModel = require("../models/WalletSchema");
const { createUserWithWallet } = require("../services/walletService");
const { getAcctNumberFromPhone } = require("../helpers/getAcctNumberFromPhone");
const { generate } = require("otp-generator");
const { default: axios } = require("axios");
const { sendOtpWithTermii, verifyOtpWithTermii } = require("../services/smsService");
require('dotenv').config();






/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.generateOtp = async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        // check if phone number already exists
        const user = await UserModel.findOne({phoneNumber});
        if (user) return badRequestResponse(res, "Phone number already exists");

        // send otp to phone number
        const { pinId, to } = await sendOtpWithTermii(phoneNumber);
        if (!pinId || to !== phoneNumber) return errorResponse(res, `Failed to send otp to ${phoneNumber}`);

        res.cookie('termiiPinId', pinId, { httpOnly: true, maxAge: 90000 });
        successResponse(res, { message: `Otp sent to this number: ${phoneNumber}` });
    } catch (error) {
        errorResponse(res, (error?.response?.data?.message ?? error.message), error?.response?.status ?? 500);
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const cookiePinId = req.cookies?.termiiPinId;

    try {
        // verify otp and pinId from http cookie
        if (!cookiePinId) return badRequestResponse(res, "Otp verification timeout, please try again");

        const { pinId, verified, msisdn } = await verifyOtpWithTermii(otp, cookiePinId);

        if (!pinId) return errorResponse(res, 'Failed to verify otp. Please try again');
        if (pinId !== cookiePinId) return badRequestResponse(res, "This otp is not for this client device");

        if (verified !== true) return unauthorizedResponse(res, "Invalid OTP");

        successResponse(res, { message: 'Otp verified successfully.', phoneNumber: msisdn });
    } catch (error) {
        const respData = error?.response?.data;
        res.cookie('termiiPinId', cookiePinId, { httpOnly: true, maxAge: 90000 });

        if (respData?.verified === "Expired") {
            return errorResponse(res, "Otp has expired! Please try again.", respData?.status);
        } else if (respData?.verified === "Insufficient funds") {
            return errorResponse(res, "Insuffiecient funds");
        } else errorResponse(res, 'Something went wrong while verifying otp.');
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

