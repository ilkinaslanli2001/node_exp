const ApiError = require("../exceptions");
const {validationResult} = require("express-validator");
const messageService = require('../services/message-service')

class MessageController {
    async create_message(req, res, next) {
        try {
            const validation_result = await validationResult(req)
            let errors = {}
            if (!validation_result.isEmpty()) {
                validation_result.errors.map(error => {
                    errors[error.param] = error.msg
                })
                return next(ApiError.UnprocessableEntity('Data is not valid', errors))
            }
            const senderId = req.body.id
            const conversationId = req.body.conversation_id
            const data = req.body.data
            const lang = req.body.lang

            await messageService.create_message(conversationId, senderId, data, lang)
            return res.json({message: 'Success'})
        } catch (e) {
            next(e)
        }
    }
    async get_conversation_messages(req,res,next)
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
            const conversationId = req.body.conversation_id
            const userId = req.body.id
            const companionId = req.body.companion_id
            const data =  await messageService.get_conversation_messages(conversationId,userId,companionId)
            return res.json({message: 'Success',data})
        } catch (e) {
            next(e)
        }
    }
    async mark_messages_as_read(req,res,next)
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

            const conversationId = req.body.conversation_id
            const companionId = req.body.companion_id
            const data =  await messageService.mark_messages_as_read(companionId,conversationId)
            return res.json({message: 'Success',data})
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new MessageController()
