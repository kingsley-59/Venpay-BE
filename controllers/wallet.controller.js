const { notFoundResponse, successResponse, errorResponse } = require("../helpers/apiResponse");
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