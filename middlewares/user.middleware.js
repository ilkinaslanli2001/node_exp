const ApiError = require('../exceptions')
const User = require("../models/User");
module.exports = async (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const id = req.body.id
        if (req.user.id !== id) {
            return next(ApiError.UnauthorizedError('Wrong Access Token'))
        }
        req.user = await User.findById(req.user.id)
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
