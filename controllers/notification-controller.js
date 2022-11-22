const ApiError = require("../exceptions");
const {validationResult} = require("express-validator");
const notificationService = require('../services/notification-service')
class NotificationController
{
    async make_notifications_read(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            await notificationService.make_notifications_read(req.body.id)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
    async get_user_notifications(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const data = await notificationService.get_user_notifications(req.body.id)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new NotificationController()
