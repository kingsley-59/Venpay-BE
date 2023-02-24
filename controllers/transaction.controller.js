const { request, response } = require('express');
const UserModel = require('../models/userSchema');
const { sendMoneyService } = require('../services/transactionService');
const flutterwave = require('flutterwave-node-v3');
const { successResponse, errorResponse } = require('../helpers/apiResponse');
const { generateRandomString } = require('../helpers/generateRandomString');
const ReferenceModel = require('../models/referenceSchema');
const flw = new flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

function sendNotification() { }

function sendAlertEmail() { }


/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.sendMoneyController = async (req, res) => {
    const userId = req.user.id;
    const { amount, accountNumber } = req.body;

    try {
        const { data } = await sendMoneyService('success', amount, userId, accountNumber)

        sendNotification();

        res.status(200).json({ status: 'success', message: `Debit: ${data.amount} was sent to ${data.recipientAcctName}.` })
    } catch (error) {
        res.status(500).json({ message: `Transaction failed: ${error.message}` });
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.receiveMoneyController = async (req, res) => {

}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.topUpController = async (req, res) => {

}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.withdrawController = async (req, res) => {

}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.generateVirtualAccount = async (req, res) => {
    const userId = req.user?.id;

    try {
        const user = await UserModel.findById(userId);
        const reference = `${user.firstName}-${generateRandomString()}`;
        const newRef = await ReferenceModel.create({
            user: user._id,
            reference, active: true
        })
        const payload = {
            email: user.email,
            firstname: user.firstName,
            lastname: user.lastName,
            phonenumber: user.phoneNumber,
            type: 'nuban',
            currency: 'NGN',
            is_permanent: false,
            tx_ref: newRef.reference,
        }
        const { data } = await flw.VirtualAcct.create(payload);
        successResponse(res, data);
    } catch (error) {
        errorResponse(res, error.message);
    }
}