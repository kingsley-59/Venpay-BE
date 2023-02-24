const { badRequestResponse, successResponse } = require("../helpers/apiResponse");
const ReferenceModel = require("../models/referenceSchema");
const WalletModel = require("../models/WalletSchema");
const router = require('express').Router();


/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const fundVirtualAccount = async (req, res) => {
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verify-hash"];
    // if (!signature || (signature !== secretHash)) {
    //     res.status(401).end();
    // }
    const { event, data, "event.type": eventType } = req.body;
    if (event !== 'charge.completed' || eventType !== 'BANK_TRANSFER_TRANSACTION') return successResponse(res, { message: 'Ok' })

    const { reference, amount, accountNumber } = data;
    console.log(data);
    const session = await WalletModel.startSession();
    session.startTransaction();

    try {
        // check if reference is still active
        const ref = await ReferenceModel.findOne({ reference });
        if (!ref) return badRequestResponse(res, 'this tx_ref is not from us.');
        if (!ref.active) return res.status(200).end();

        const userWallet = await WalletModel.findOne({ user: ref.user }, null, { session });
        if (!userWallet) return successResponse(res, { message: 'User wallet no longer exist.' })
        userWallet.balanace += amount;
        await userWallet.save({ session });
        ref.active = false;
        await ref.save({ session })

        await session.commitTransaction();
        session.endSession();
        successResponse(res, { message: `Credit: ${amount} received from ${accountNumber}` });
    } catch (error) {
        session.abortTransaction()
        session.endSession()
        console.log(error)
        badRequestResponse(res, error.message)
    }
}


router.post('/', fundVirtualAccount);

module.exports = router;