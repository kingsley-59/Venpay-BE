const { request, response } = require('express');
const { sendMoneyService } = require('../services/transactionService');


function sendNotification() { }

function sendAlertEmail() { }


/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.sendMoneyController = async (req, res) => {
    const userId = req.user.id;
    const { amount, accountNumber } = req.body;

    try {
        const { data } = await sendMoneyService('success', amount, userId, accountNumber)

        sendNotification();

        res.status(200).json({ status: 'success', message: `Debit: ${data.amount} was sent to ${data.recipientAcctName}.` })
    } catch (error) {
        res.status(500).json({ message: 'Transaction processing failed.' });
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.receiveMoneyController = async (res, req) => {

}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.topUpController = async (res, req) => {

}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.withdrawController = async (res, req) => {

}