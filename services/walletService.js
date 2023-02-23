const UserModel = require("../models/userSchema");
const WalletModel = require("../models/WalletSchema");


/**
 * 
 * @param {{
 * firstName: String,
 * lastName: String,
 * email: String,
 * phoneNumber, password,
 * address: String
 * }} userData 
 * @param {Number} valididAcctNumber 
 * @returns 
 */
exports.createUserWithWallet = async (userData, valididAcctNumber) => {
    const { firstName, lastName, email, phoneNumber, password, address } = userData;

    const session = await UserModel.startSession();
    session.startTransaction();
    try {
        const newUser = await UserModel.create({
            firstName, lastName, email, phoneNumber, password, address, session
        });
        delete newUser['password'];
        const newWallet = await WalletModel.create({
            user: newUser._id,
            accountName: `${newUser.firstName} ${newUser.lastName}`,
            accountNumber: valididAcctNumber,
            session
        });

        session.commitTransaction();
        session.endSession();
        return { ...newUser.toObject(), ...newWallet.toObject(), password: null, _id: null };
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw error;
    }
}