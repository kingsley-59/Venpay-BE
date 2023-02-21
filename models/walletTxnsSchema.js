const { Schema, model } = require("mongoose");
const { TransactionModel } = require("./transactionSchema");


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



// update transaction record when a reference schema is updated
WalletTxnsSchema.post('update', async function () {
    const transaction = this.getQuery()._id;
    await TransactionModel.updateMany({ details: transaction }, { $currentDate: { updatedAt: true } });
});



exports.WalletTxnsModel = model('WalletTransactions', WalletTxnsSchema);




// // add a new transaction when a wallet transaction is added
// WalletTxnsSchema.post('save', async function(doc, next) {
//     await TransactionModel.create({
//         type: doc.type,
//         transactionType: doc.transactionType,
//         amount: doc.amount,
//         details: doc._id
//     })
// });