/* 
To create a transaction service, consistency in records across models must be maintained.
- determine the transaction type
- adjust the figures of he necessary records according to debit or credit
- save transaction and update wallet

Recall, the transactions fall under 4 categories: 
'send_money', 'receive_money', 'top_up', 'withdraw', 'transfer'
*/

const { default: mongoose } = require("mongoose");
const { generateRandomString } = require("../helpers/generateRandomString");
const TransactionModel = require("../models/transactionSchema");
const WalletModel = require("../models/WalletSchema");


class Categories {
    walletTransactions = [];
    bankTransactions = [];
    all = [];

    constructor() {
        this.walletTransactions = ['send_money', 'receive_money'];
        this.bankTransactions = ['top_up', 'withdraw'];
        this.all = [...this.walletTransactions, ...this.bankTransactions];

        return this.all;
    }
}

function creditOrDebit(type) {
    return (type === 'top_up' || type === 'receive_money') ? 'credit' : 'debit';
}


exports.sendMoneyService = async function (status, amount, senderId, recipientAcctNumber, description = '', charge = 0, category = 'send_money') {
    const amountWithCharge = amount + charge;
    if (status !== 'success' && status !== 'failed') throw new Error('status must be either success or failed');
    if (amount < 1) throw new Error('Amount must be a valid integer');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sender = await WalletModel.findOne({ user: senderId }, null, { session });
        const recipient = await WalletModel.findOne({ accountNumber: recipientAcctNumber }, null, { session });
        if (sender._id.toString() === recipient._id.toString()) throw new Error('You cannot send money to yourself;');

        // check if sender has enough for the transaction
        if (sender.balanace < amountWithCharge) throw new Error('Insufficient balance');

        //debit sender
        sender.balanace = sender.balanace - amountWithCharge;
        let senderNewBal = (await sender.save({ session })).balanace;
        console.log('The sender new balance:', senderNewBal);

        // credit recipient
        recipient.balanace = recipient.balanace + amount;
        let recipientNewBal = (await recipient.save({ session })).balanace;
        console.log('The recipient new balance:', recipientNewBal);

        // save transaction
        const newTransaction = new TransactionModel({
            amount, category, status,
            senderAcctName: sender.accountName,
            senderAcctNumber: sender.accountNumber,
            senderBank: process.env.BANK_NAME,
            recipientAcctName: recipient.accountName,
            recipientAcctNumber: recipient.accountNumber,
            recipientBank: process.env.BANK_NAME,
            description,
            reference: `${sender.accountName}-${generateRandomString()}`,
            transactionType: creditOrDebit()
        });
        await newTransaction.save({ session });

        await session.commitTransaction();

        return Object.freeze({ data: newTransaction });
    } catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}

exports.receiveMoneyService = async function (senderId, recipientId) {

}

exports.topUpService = async function () {

}

exports.withdrawService = async function () {

}