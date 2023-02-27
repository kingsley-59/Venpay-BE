const flutterwave = require("flutterwave-node-v3");
const { successResponse, errorResponse } = require("../helpers/apiResponse");
require('dotenv').config();
const flw = new flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

exports.resolveBankDetails = async (req, res) => {
    const { accountNumber, bankCode } = req.body;

    try {
        const payload = {
            "account_number": accountNumber,
            "account_bank": bankCode,
            "country": "NG"
        }
        const response = await flw.Misc.verify_Account(payload)
        console.log(response);

        successResponse(res, response);
    } catch (error) {
        console.log(error)
        errorResponse(res, error.message);
    }
}

exports.getAllBanks = async (req, res) => {
    const { country } = req.body;

    try {
        const payload = {
            "country": country || "NG" //Pass either NG, GH, KE, UG, ZA or TZ to get list of banks in Nigeria, Ghana, Kenya, Uganda, South Africa or Tanzania respectively
        }
        const response = await flw.Bank.country(payload)
        console.log(response);

        successResponse(res, {...response, count: response.data.length});
    } catch (error) {
        console.log(error);
        errorResponse(res, error.message);
    }
}