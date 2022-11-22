const rideService = require('../services/ride-service')
const ApiError = require("../exceptions");
const {validationResult} = require("express-validator");

class RideController {
    async start_ride(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const driverId = req.body.id
            const rideId = req.body.ride_id
            const lang = req.body.lang || "az"

            await rideService.start_ride(driverId, rideId, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async delete_passenger_from_ride(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            await rideService.delete_passenger_from_ride(req.body.id, req.body.passenger_id, req.body.ride_id, req.body.block_point, req.body.decline_case, req.body.lang || "az")
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async finish_ride(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const driverId = req.body.id
            const rideId = req.body.ride_id
            const lang = req.body.lang || "az"

            await rideService.finish_ride(driverId, rideId, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async add_ride(req, res, next) {

        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            await rideService.add_ride(req.user, req.body)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }

    async search_rides(req, res, next) {
        try {
            const limit = parseInt(req.query.limit)
            const offset = parseInt(req.query.offset)
            const filter_options = req.body.filter_options
            const arrive_city = req.body.arrive_city
            const departure_city = req.body.departure_city
            const data = await rideService.search_rides(arrive_city, departure_city, limit, offset, filter_options)

            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }

    async add_passenger_to_ride(req, res, next) {
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
            const user = req.user
            const numberOfSeats = req.body.number_of_seats
            const lang = req.body.lang || "az"
            const data = await rideService.add_passenger_to_ride(rideId, user, numberOfSeats, lang)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }

    async get_ride_info(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const data = await rideService.get_ride_info(req.params.rideId,true)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }


    async set_ride_active_state(req,res,next)
    {
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
            const user = req.user
            const state = req.body.state
            const lang = req.body.lang || "az"
            await rideService.set_ride_active_state(user.id,rideId, state,lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new RideController()
