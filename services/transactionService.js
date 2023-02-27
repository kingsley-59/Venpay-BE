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
const UserModel = require("../models/userSchema");
const WalletModel = require("../models/WalletSchema");
const flutterwave = require('flutterwave-node-v3');
require('dotenv').config();

const flw = new flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

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

exports.topUpService = async function (userId) {
    try {
        const user = await UserModel.findById(userId);

    } catch (error) {

    }
}

exports.withdrawService = async function ({ userId, amount, accountName, accountNumber, bankName, bankCode }) {
    try {
        // get user wallet
        const wallet = await WalletModel.findOne({ user: userId });

        // initiate transfer
        const payload = {
            "account_bank": bankCode, //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
            "account_number": accountNumber,
            "amount": amount,
            "narration": "",
            "currency": "NGN",
            "reference": generateRandomString(10), //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
            "callback_url": "http://localhost:3000/webhook",
            "debit_currency": "NGN"
        }
        const response = await flw.Transfer.initiate(payload);
        console.log(response);
        if (response.status === "success") {
            const prevBal = wallet.balanace
            wallet.balanace = wallet.balanace - amount;
            await wallet.save();
            console.log('Previous bal: ', prevBal);
            console.log('Current Bal: ', wallet.balanace);
        } else {
            throw new Error(response.message)
        };

        // save transaction
        const transaction = await TransactionModel.create({
            category: 'withdraw',
            transactionType: 'debit',
            status: 'success',
            amount,
            reference: `${wallet.accountName}-${generateRandomString()}`,
            senderAcctName: wallet.accountName,
            senderAcctNumber: wallet.accountNumber,
            senderBank: process.env.BANK_NAME,
            recipientAcctName: accountName,
            recipientAcctNumber: accountNumber,
            recipientBank: bankName
        });

        // if transfer if successful, update user wallet
        if (transaction) {
            
        }

        return true;
    } catch (error) {
        throw error;
    }
}