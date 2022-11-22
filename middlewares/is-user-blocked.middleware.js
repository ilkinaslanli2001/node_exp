const ApiError = require('../exceptions')
const {user_is_blocked} = require("../constants/translations");
const {BLOCK_COUNT} = require("../constants/constant");
module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next()
    }
    const lang = req.body.lang || "az"
    const user = req.user
    if (user.block_count >= BLOCK_COUNT) {
        return next(ApiError.BadRequest(user_is_blocked[lang]))
    } else {
        next()
    }
}
