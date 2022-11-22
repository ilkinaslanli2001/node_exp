const ApiError = require("../exceptions");
const {validationResult} = require("express-validator");
const conversationService = require('../services/conversation-service')

class ConversationController {
    async create_conversation(req, res, next) {
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
            const userId = req.body.id
            const receiverId = req.body.receiver_id
            const lang = req.body.lang
            const data= await conversationService.create_conversation(userId, receiverId, rideId, lang)
            return res.json({message: 'Success',data})
        } catch (e) {
            next(e)
        }
    }

    async get_user_conversations(req, res, next) {
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
            const data = await conversationService.get_user_conversations(userId)
            return res.json({message: 'Success', data})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new ConversationController()
