const { Schema, model } = require("mongoose");
const { getAcctNumberFromPhone } = require("../helpers/getAcctNumberFromPhone");


const WalletSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    accountName: { type: String, required: [true, 'account name is required'] },
    accountNumber: { type: Number, required: [true, 'account number required'], unique: true },
    balanace: { type: Number, default: 0 },
}, { timestamps: true });


// Set the default account name to be the concatenation of the user's first and last name
WalletSchema.pre('save', async function (next) {
    if (this.isModified('user')) {
        const user = await model('User').findById(this.user);
        if (user) {
            this.accountName = `${user.firstName} ${user.lastName} Wallet`;
            this.accountNumber = getAcctNumberFromPhone(user.phoneNumber)
            next();
        } else {
            const err = new Error('User no longer exists.');
            next(err);
        }
    } else next();
});


const WalletModel = model('Wallet', WalletSchema);
module.exports = WalletModel