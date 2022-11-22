const ApiError = require('../exceptions')

const {invalid_phone_number, invalid_data} = require("../constants/translations");
module.exports = async (req, res, next) => {
    // middleware for checking whether phone number exists
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        let {phone_number, lang} = req.body
        if (phone_number.length !== 9 || !/^\d+$/.test(phone_number)) {
            //ToDo phone number validation
            next(ApiError.UnprocessableEntity(invalid_data[lang], {phone_number: invalid_phone_number[lang]}))
        }
        next()
    } catch (e) {

        return next(ApiError.BadRequest(e.body))
    }
}
