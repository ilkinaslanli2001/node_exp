const otpService = require('../services/otp-service')
const ApiError = require('../exceptions')
const {validationResult} = require("express-validator");


class OTPController {
    async send(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }
            const {phone_number, type} = req.body
            await otpService.send(phone_number, type)
            return res.json({message: "Success"})
        } catch (e) {
            next(e)
        }
    }

    async check(req, res, next) {

        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }
            const {phone_number, code, lang} = req.body
            await otpService.check(phone_number, code, lang ?? 'az')
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

}


module.exports = new OTPController()
