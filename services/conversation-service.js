const Conversation = require('../models/Conversation')
const User = require('../models/User')
const {
    checkIfRideExists,

} = require('../helpers/ride-helper')
const messageService = require('../services/message-service')
const {get_conversation_info} = require("../helpers/conversation-helper");

class ConversationService {

    async create_conversation(userId, receiverId, rideId, lang) {
        await checkIfRideExists(rideId, false)
        const conversation = await get_conversation_info(userId, receiverId)
        if (conversation)
            return conversation
        const newConversation = {
            members: [userId, receiverId],
            ride_id: rideId
        }
        return Conversation.create(newConversation)
    }

    async get_user_conversations(userId) {

        const filteredConversations = []
        const conversations = await Conversation.find({members: {$in: [userId]}, date_of_delete: null})
        for (const conversation of conversations) {

            const companionId = conversation.members.find((member) => {
                return member !== userId
            })
            const companion = await User.findById(companionId).select(['name', 'profile_picture', 'phone_number']).clone().lean(true)
            if (companion) {
                const lastMessage = await messageService.get_last_message(conversation.id)
                filteredConversations.push({
                    conversation_id: conversation.id,
                    ...companion,
                    last_message: lastMessage
                })
            }
        }

        return filteredConversations.sort((conv, nextConv) => {
            return nextConv.last_message['date'] - conv.last_message['date']
        })
    }

}

module.exports = new ConversationService()
