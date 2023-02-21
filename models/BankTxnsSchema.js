const { Schema, model } = require("mongoose");


const BankTxnsSchema = new Schema({
    bank: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['success', 'fail', 'pending'],
        required: true
    },
    channel: {
        type: String,
        enum: ['transfer', 'card'],
        default: ['transfer'],
        required: true
    },
    card: {
        type: Object
    },
}, { timestamps: true });



exports.BankTxnsModel = model('BankTransactions', BankTxnsSchema);