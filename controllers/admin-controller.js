const ApiError = require("../exceptions")
const adminService = require("../services/admin-service")
const rideService = require("../services/ride-service")
const commonService = require("../services/common-services")
const {validationResult} = require("express-validator")

class AdminController {


    async add_features_of_ride(req, res, next) {
        try {
            let {json_data} = req.body
            await adminService.add_features_of_ride(json_data)
            return res.json({message: "success"})
        } catch (e) {
            next(e)
        }
    }

    async get_requests_for_verification(req, res, next) {
        try {

            const data = await adminService.get_requests_for_verification()
            return res.json({message: "success", requests: data})
        } catch (e) {
            next(e)
        }
    }

    async response_to_request(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            await adminService.request_for_verifications(
                req.body.request_id,
                req.body.type
            )
            return res.json({message: "Success"})
        } catch (e) {
            next(e)
        }
    }

    async change_common_data(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            const updatedData = await commonService.change_data(
                req.body.key,
                req.body.json_data
            )
            return res.json({message: "Success", data: updatedData})
        } catch (e) {
            next(e)
        }
    }

    async search_users(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            const result = await adminService.search_users(
                req.body.search_query,
                req.body.get_drivers,
                req.body.current_page
            )
            return res.json({message: "Success", search_result: result})
        } catch (e) {
            next(e)
        }
    }

    async get_or_edit_user_info(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            const userInfo = await adminService.get_or_edit_user_info(
                req.body.user_id,
                req.body.user_info
            )
            return res.json({message: "Success", data: userInfo})
        } catch (e) {
            next(e)
        }
    }
    async get_other_data(req, res, next) {
        try {
            const result = await commonService.get_data("other_data")

            return res.json({ message: "Success", data: result.data })
        } catch (e) {
            next(e)
        }
    }
    async get_transactions(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }
            const transactionsData = await adminService.get_transactions(req.body.account_number, req.body.current_page)
            return res.json({message: "Success", transactions_result: transactionsData})
        } catch (e) {
            next(e)
        }
    }

    async get_rides(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            const ridesData = await adminService.get_rides(req.body.ride_state, req.body.current_page)
            return res.json({message: "Success", rides_result: ridesData})
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
            const data = await rideService.get_ride_info(req.params.rideId, false)
            return res.json({message: 'Success', ride_info: data})
        } catch (e) {
            next(e)
        }
    }

    async send_notification(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }

            await adminService.send_notification(
                req.body.title,
                req.body.body,
                req.body.user_type,
                req.body.phone_number
            )
            return res.json({message: "Success"})
        } catch (e) {
            next(e)
        }
    }

    async edit_ride_info(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}

            if (!validation_result.isEmpty()) {
                validation_result.errors.map((error) => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity("Data is not valid", errors))
            }
            const rideId = req.params.ride_id
            await adminService.edit_ride_info(
                rideId,
                req.body.edited_ride,
            )
            const ride = await rideService.get_ride_info(rideId, false)

            return res.json({message: "Success", ride})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new AdminController()
