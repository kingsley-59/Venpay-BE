const { TransactionModel } = require("../models/transactionSchema");
const { WalletTxnsModel } = require("../models/walletTxnsSchema")



exports.createWalletTransaction = async function (walletData, transactionData) {
    const session = await WalletTxnsModel.startSession();
    session.startTransaction();

    try {
        const walletTransaction = await WalletTxnsModel.create(walletData, { session });
        const newTransaction = await TransactionModel.create({
            ...transactionData, details: walletTransaction._id
        }, { session })

        await session.commitTransaction();
        session.endSession();

        return { ...newTransaction, details: walletTransaction };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}