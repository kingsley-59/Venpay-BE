const { Schema, model } = require("mongoose");


const WalletTxnsSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        required: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'fail', 'pending'],
        required: true
    },
    message: {
        type: String,
    }
}, { timestamps: true });


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


const TransactionSchema = new Schema({
    type: {
        type: String,
        enum: ['send_money', 'receive_money', 'top_up', 'withdraw', 'transfer'],
        required: true
    },
    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: Schema.Types.ObjectId,
        ref: ['WalletTransactions', 'BankTransactions'],
        required: true
    }
}, { timestamps: true });


TransactionSchema.pre('save', function (next) {
    if (this.type === 'top_up' || this.type === 'receive_money') {
        this.transactionType = 'credit';
    } else {
        this.transactionType = 'debit';
    }
    next();
});

WalletTxnsSchema.post('update', async function () {
    const transaction = this.getQuery()._id;
    await TransactionModel.updateMany({ details: transaction }, { $currentDate: { updatedAt: true } });
});


const WalletTxnsModel = model('WalletTransactions', WalletTxnsSchema);
const BankTxnsModel = model('BankTransactions', BankTxnsSchema);
const TransactionModel = model('Transactions', TransactionSchema);

module.exports = {
    WalletTxnsModel, BankTxnsModel, TransactionModel
}