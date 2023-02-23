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
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        unauthorizedResponse(res, 'Unathorized! Please log in.');
    }
}