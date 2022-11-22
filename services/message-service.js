const {get_conversation_info} = require("../helpers/conversation-helper");
const Message = require('../models/Message')
const Conversation = require('../models/Conversation')


class MessageService {
    async create_message(conversationId, senderId, data) {
        const conversation = Conversation.findById(conversationId)
        if (conversation) {
            await Message.create({
                conversation_id: conversationId,
                sender_id: senderId,
                data
            })

        }


        return true
    }

    async get_conversation_messages(conversationId, userId, companionId) {

        let messages = []
        if (conversationId) {
            messages = await Message.find({'conversation_id': conversationId})
        } else {
            const conversation = await get_conversation_info(userId, companionId)

            if (conversation)
                messages = await Message.find({'conversation_id': conversation.id})
        }

        return messages
    }


    async get_last_message(conversationId) {
        const allMessages = await Message.find({'conversation_id': conversationId});
        if (allMessages.length > 0) {

            return allMessages[allMessages.length - 1]
        } else return null
    }

    async mark_messages_as_read(companionId, conversationId) {

        await Message.updateMany({conversation_id: conversationId, sender_id: companionId}, {$set: {is_read: true}})
        return true

    }
}

module.exports = new MessageService()
