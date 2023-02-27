const { request, response } = require('express');
const UserModel = require('../models/userSchema');
const { sendMoneyService, withdrawService } = require('../services/transactionService');
const flutterwave = require('flutterwave-node-v3');
const { successResponse, errorResponse, badRequestResponse } = require('../helpers/apiResponse');
const { generateRandomString } = require('../helpers/generateRandomString');
const ReferenceModel = require('../models/referenceSchema');
const WalletModel = require('../models/WalletSchema');
const TransactionModel = require('../models/transactionSchema');
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
    const userId = req.user.id;

    try {
        const wallet = await WalletModel.findOne({ user: userId });
        if (!wallet) return badRequestResponse(res, "Wallet not found. Please register, or login if you have an account");

        successResponse(res, { data: wallet.toObject() });
    } catch (error) {
        errorResponse(res, { message: "Something went wrong" });
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.withdrawController = async (req, res) => {
    const userId = req.user.id;
    const { amount, accountName, accountNumber, bankName, bankCode } = req.body;
    if (!userId) return badRequestResponse(res, "You don't have access to this resource. Please login");
    if (!amount) return badRequestResponse(res, "Amount is required");
    if (!accountNumber) return badRequestResponse(res, "Destination account number is required.");
    if (!bankCode) return badRequestResponse(res, "Destination bank is required");

    try {
        const response = await withdrawService({userId, amount, accountName, accountNumber, bankName, bankCode});
        if (response !== true) return errorResponse(res, "Transaction failed: Withdrawal could not be completed", 502);
        
        return successResponse(res, { message: "Debit: Withdrawal successfull." });
    } catch (error) {
        errorResponse(res, `Transaction failed: ${error.message}`);
    }
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
        });
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


/** Webhook Controllers */

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.fundVirtualAccountWebhook = async (req, res) => {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verify-hash"];
    if (!signature || (signature !== secretHash)) {
        res.status(401).end();
    }
    const { event, data, "event.type": eventType } = req.body;
    if (event !== 'charge.completed' || eventType !== 'BANK_TRANSFER_TRANSACTION') return successResponse(res, { message: 'Ok' })

    const { reference, amount, accountNumber } = data;
    console.log(data);
    const session = await WalletModel.startSession();
    session.startTransaction();

    try {
        // check if reference is still active
        const ref = await ReferenceModel.findOne({ reference });
        if (!ref) return badRequestResponse(res, 'this tx_ref is not from us.');
        if (!ref.active) return res.status(200).end();

        const userWallet = await WalletModel.findOne({ user: ref.user }, null, { session });
        if (!userWallet) return successResponse(res, { message: 'User wallet no longer exist.' })
        userWallet.balanace += amount;
        await userWallet.save({ session });
        ref.active = false;
        await ref.save({ session })

        await session.commitTransaction();
        session.endSession();
        successResponse(res, { message: `Credit: ${amount} received from ${accountNumber}` });
    } catch (error) {
        session.abortTransaction()
        session.endSession()
        console.log(error)
        badRequestResponse(res, error.message)
    }
}
