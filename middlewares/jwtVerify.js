const jwt = require('jsonwebtoken');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization
        const tkn = req.header('x-auth-token')
    } catch (error) {
        
    }
}