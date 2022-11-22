const userService = require('../services/user-service')
const jwtService = require('../services/jwt-service')
const jwt = require('jsonwebtoken')
const ApiError = require("../exceptions");
const {decryptCookie} = require("../helpers/cookie-helper");
const {validationResult} = require("express-validator");
require("dotenv").config({path: '../.env'})

class UserController {

    async me(req, res, next) {

        try {
            const access_token = req.headers?.authorization?.split(' ')[1] ?? decryptCookie(req.cookies.access_token)

            if (!access_token)
                return next(ApiError.UnauthorizedError('Token info', {access_token: 'Access token is invalid'}))

            const decoded = jwtService.validateAccessToken(access_token)
            if (!decoded)
                return next(ApiError.UnauthorizedError('Token info', {access_token: 'Access token is invalid'}))

            const data = await userService.me(decoded.phone_number)
            return res.status(200).json({message: 'Success', user: data})
        } catch (e) {
            next(e)
        }

    }


    // get all driver rides
    async get_rides_driver(req, res, next) {
        try {
            const data = await userService.get_rides_driver(req.body.id)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }

    async get_passenger_rides(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }

            const userId = req.body.id
            const data = await userService.get_passenger_rides(userId)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }

    async change_user_settings(req, res, next) {
        try {

            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }

            await userService.change_user_settings(req.body)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async change_user_profile_picture(req, res, next) {

        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const data = await userService.change_user_profile_picture(req.body.id, req.file)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }

    async request_for_verifications(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }

            await userService.request_for_verifications(req.body.id, req.files)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async passenger_decline_ride(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const user = req.user
            const rideId = req.body.ride_id
            const numberOfDeclinedPlaces = req.body.number_of_declined_places
            const blockPoint = req.body.block_point
            const declineCase = req.body.decline_case
            const lang = req.body.lang
            await userService.passenger_decline_ride(user, rideId, numberOfDeclinedPlaces, blockPoint, declineCase, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async driver_decline_ride(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }

            const rideId = req.body.ride_id
            const lang = req.body.lang
            await userService.driver_decline_ride(req.user, rideId, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }


    async change_user_rating(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const passengerId = req.body.id
            const driverId = req.body.driver_id
            const rating = req.body.rating
            const lang = req.body.lang

            await userService.change_user_rating(passengerId, driverId, rating, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async user_balance(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const userId = req.body.id

            const data = await userService.user_balance(userId)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }


    async delete_rate_from_queue(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const passengerId = req.body.id
            const driverId = req.body.driver_id


            await userService.delete_rate_from_queue(passengerId, driverId)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

}

module
    .exports = new UserController()
