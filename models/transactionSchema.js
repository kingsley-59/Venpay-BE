const { Schema, model } = require("mongoose");


const TransactionSchema = new Schema({
    category: {
        type: String,
        enum: ['send_money', 'receive_money', 'top_up', 'withdraw', 'transfer'],
        required: true
    },
    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String },
    reference: { type: String, required: true },

    senderAcctName: { type: String, required: true },
    senderAcctNumber: { type: Number, required: true },
    senderBank: { type: String, required: true, },
    recipientAcctName: { type: String, required: true },
    recipientAcctNumber: { type: Number, required: true },
    recipientBank: { type: String, required: true },

}, { timestamps: true });




const TransactionModel = model('Transactions', TransactionSchema);
module.exports = TransactionModel;