const jwt = require('jsonwebtoken');
const { unauthorizedResponse } = require('../helpers/apiResponse');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
*/
exports.jwtVerifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        unauthorizedResponse(res, 'Unathorized! Please log in.');
    }
}