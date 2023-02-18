const { request, response } = require('express');
const { badRequestResponse, successResponse, errorResponse } = require('../helpers/apiResponse');
const UserModel = require('../models/userSchema');


/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.getUsers = async (req, res) => {
    const { id, role } = req.user;

    try {
        
    } catch (error) {
        
    }
};

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.getUserById = async (req, res) => {
    const { id, role } = req.user;
    const userId = req.params.id;

    try {
        
    } catch (error) {
        
    }
};

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.updateProfile = async (req, res) => {
    const { lastName, firstName, phoneNumber } = req.body;

    try {
        if (firstName?.length < 3 || lastName?.length < 3) return badRequestResponse(res, 'first and last name must be 3 or more characters.');

        const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, {...req.body}, {new: true});
        return successResponse(res, {...updatedUser, password: ''})
    } catch (error) {
        errorResponse(res, error);
    }
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 */
exports.deleteUser = async (req, res) => {
    const { id, role } = req.user;
    const userId = req.params.id;

    try {
        
    } catch (error) {
        
    }
};