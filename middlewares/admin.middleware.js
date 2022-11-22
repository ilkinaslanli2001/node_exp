// checks if access_token belongs to id that admin sent and user with this id has "is_admin" == true

const constants = require('../constants/constant');
const ApiError = require('../exceptions')
const User = require("../models/User");
module.exports = async (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const user = req.user
        if (user.role !== constants.ADMIN) {
            return next(ApiError.UnauthorizedError('You dont have enough permissions'))
        }
        next()
    } catch (e) {

        return next(ApiError.UnauthorizedError())
    }
}
