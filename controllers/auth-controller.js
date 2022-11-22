const {validationResult} = require('express-validator')
const autService = require('../services/auth-service')
const ApiError = require('../exceptions')
const {condition} = require("../helpers/cookie-helper");
const {encryptCookie,decryptCookie} = require('../helpers/cookie-helper')

class AuthController {
    async sign_in(req, res, next) {
        try {
            const validation_result = validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const {phone_number, password, lang} = req.body
            const data = await autService.sign_in(phone_number, password, lang)
            return res.json({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                userId: data.id
            })
        } catch (e) {
            next(e)
        }
    }

    async password_recovery_request(req, res, next) {
        try {
            const validation_result = validationResult(req)
            let errors = {}

            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const {phone_number, lang} = req.body
            const data = await autService.password_recovery_request(phone_number, lang)
            return res.json({
                'message': 'Success',
                'request_id': data.id
            })
        } catch (e) {

            next(e)
        }
    }

    async password_recovery(req, res, next) {
        try {
            const validation_result = validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const {recovery_request_id, password, lang} = req.body
            await autService.password_recovery(recovery_request_id, password, lang)
            return res.json({
                'message': 'Success',
            })
        } catch (e) {
            next(e)
        }
    }

    async sign_in_admin(req, res, next) {
        try {
            const validation_result = validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const {phone_number, password} = req.body
            const data = await autService.sign_in_admin(phone_number, password)
            return res.cookie("access_token", encryptCookie(data.access_token), condition).cookie("refresh_token", encryptCookie(data.refresh_token), condition).json({message: 'Success'})

        } catch (e) {
            next(e)
        }
    }

    async sign_up(req, res, next) {
        try {

            const validation_result = validationResult(req)
            let errors = {}

            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const {phone_number, name, password, car_info, lang} = req.body
            const data = await autService.sign_up(name, phone_number, password, car_info, lang)
            return res.json({
                'message': 'Success',
                'userId': data.id
            })
        } catch (e) {

            next(e)
        }
    }


    async logout(req, res, next) {
        try {
            const {refresh_token} = req.body
            await autService.logout(refresh_token)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
    async logout_admin(req, res, next) {
        try {
            const refresh_token = req.cookies.refresh_token
            await autService.logout(decryptCookie(refresh_token))
            return res.clearCookie("access_token").clearCookie('refresh_token').json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
    async check_phone_number(req, res, next) {
        try {
            const {phone_number, lang} = req.body
            await autService.check_phone_number(phone_number, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
}


module.exports = new AuthController()
