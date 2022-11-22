const ApiError = require('../exceptions')
const User = require('../models/User')
module.exports = async (req, res, next) => {
    // middleware for checking json
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        let {json_data} = req.body


        if(json_data===null||json_data===undefined)
            next(ApiError.UnprocessableEntity('Invalid Data',{'json_data':'Field is empty'}))
        next()
    } catch (e) {

        return next(ApiError.BadRequest(e.body))
    }
}
