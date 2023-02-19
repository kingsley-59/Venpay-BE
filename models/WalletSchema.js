const { Schema, model } = require("mongoose");


const WalletSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    accountName: { type: String },
    accountNumber: { type: Number },
    balanace: { type: Number, default: 0 },
}, { timestamps: true });


// Set the default account name to be the concatenation of the user's first and last name
WalletSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('owner')) {
        const user = await model('User').findById(this.owner);
        if (user) {
            this.accountName = `${user.firstName} ${user.lastName} Wallet`;
            next();
        } else {
            const err = new Error('User no longer exists.');
            next(err);
        }
    } else next();
});


const WalletModel = model('Wallet', WalletSchema);
module.exports = WalletModel