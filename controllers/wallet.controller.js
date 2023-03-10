const { compare, hash } = require("bcrypt");
const { notFoundResponse, successResponse, errorResponse, badRequestResponse, unauthorizedResponse } = require("../helpers/apiResponse");
const WalletModel = require("../models/WalletSchema");


exports.getUserWallet = async (req, res) => {
    const userId = req.user.id;

    try {
        const wallet = await WalletModel.findOne({ user: userId });
        if (!wallet) return notFoundResponse(res, "No wallet was found belomging to this user.")

        successResponse(res, wallet.toObject());
    } catch (error) {
        errorResponse(res, error.message);
    }
}

exports.getAllUserWallets = async (req, res) => {
    try {
        const wallets = await WalletModel.find({});

        successResponse(res, wallets.toObject());
    } catch (error) {
        errorResponse(res, error.message);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
exports.changeTransactionPin = async (req, res) => {
    const { id } = req.user;
    const { oldPin, newPin } = req.body;

    try {
        const wallet = await WalletModel.findOne({user: id});
        if (!wallet.pinHash) return badRequestResponse(res, "You have not set a transaction pin.");
        const isVerified = await compare(oldPin, wallet?.pinHash);
        if (!isVerified) return unauthorizedResponse(res, "Incorrect pin! Please check the pin and try again");

        const newPinHash = await hash(newPin, 10);
        wallet.pinHash = newPinHash;
        await wallet.save();

        return successResponse(res, {message: "New pin set successfully"});
    } catch (error) {
        errorResponse(res, error?.message);
    }
}

exports.setTransactionPin = async (req, res) => {
    const { id } = req.user;
    const { pin } = req.body;
    
    try {
        const wallet = await WalletModel.findOne({user: id});
        if (!wallet) return badRequestResponse(res, "Wallet does not exist");
        wallet.pinHash = await hash(pin, 10);
        await wallet.save();

        successResponse(res, {message: "Transaction pin set successfully"});
    } catch (error) {
        errorResponse(res, error?.message);
    }
}