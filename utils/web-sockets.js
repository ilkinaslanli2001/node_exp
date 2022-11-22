const {
    JOIN,
    SEND_MESSAGE,
    ADD_USER,
    DISCONNECT,
    NEW_MESSAGE,
    SEND_USER_STATUS,
    GET_USER_STATUS,
    MARK_MESSAGE_AS_READ,
    UPDATE_CONVERSATION,
    ONLINE,
    OFFLINE,
    APP_PAUSED,
    APP_RESUMED,
    HAVE_UNREAD_MESSAGE
} = require('../constants/constant')
const {SIMPLE_MESSAGE} = require("../constants/constant");
const {NEW_MESSAGE_NOTIFICATION} = require("../constants/constant");
const {getUserById} = require("../helpers/user-helpers");
const {getUserBySocketId} = require("../helpers/user-helpers");
const {get_conversation_info} = require("../helpers/conversation-helper");
const NotificationService = require("../services/notification-service");
const {new_message} = require("../constants/translations");

class WebSockets {


    connection(client) {

        client.on(DISCONNECT, () => {
            const user = getUserBySocketId(client)
            global.onlineUsers = global.onlineUsers.filter((user) => user.socketId !== client.id);
            client.broadcast.emit(SEND_USER_STATUS, user, OFFLINE)
        })
        // add identity of user mapped to the socket id
        client.on(ADD_USER, async (userId) => {

            client.broadcast.emit(SEND_USER_STATUS, userId, ONLINE)
            global.onlineUsers.push({
                socketId: client.id,
                userId: userId,
            });
        });
        client.on(APP_RESUMED, () => {
            client.broadcast.emit(SEND_USER_STATUS, getUserBySocketId(client), ONLINE)
        });
        client.on(APP_PAUSED, () => {
            client.broadcast.emit(SEND_USER_STATUS, getUserBySocketId(client), OFFLINE)
        });
        client.on(GET_USER_STATUS, (companionId) => {
            const companion = global.onlineUsers.find((user) => user.userId === companionId)
            if (companion) {
                client.emit(SEND_USER_STATUS, companionId, ONLINE)
            } else client.emit(SEND_USER_STATUS, companionId, OFFLINE)

        })
        // subscribe person to chat & other user as well
        client.on(JOIN, async (room) => {

            client.join(room, (err) => {

            });

        });
        client.on(SEND_MESSAGE, async ({
                                           senderName,
                                           senderPhoneNumber,
                                           senderProfilePicture,
                                           companionId,
                                           companionName,
                                           companionPhoneNumber,
                                           companionProfilePicture,
                                           message,
                                           lang
                                       }) => {
            let isCompanionOnline = true;
            const senderId = message['sender_id']
            const sender = getUserById(senderId)
            const companion = getUserById(companionId)
            const payload = {
                ...message,
                type: SIMPLE_MESSAGE,
                date: Date.now()
            }


            const conversation = await get_conversation_info(senderId, companionId)
            if (conversation) {
                if (companion) {
                    const senderUser = {
                        _id: senderId,
                        profile_picture: senderProfilePicture,
                        phone_number: senderPhoneNumber,
                        name: senderName
                    }

                    const companionPayload = {
                        conversation_id: conversation.id,
                        ...senderUser,
                        last_message: message
                    }
                    global.io.to(companion.socketId).emit(UPDATE_CONVERSATION, companionPayload)
                    client.to(companion.socketId).emit(NEW_MESSAGE, payload)
                    client.to(companion.socketId).emit(HAVE_UNREAD_MESSAGE)
                } else {
                    isCompanionOnline = false
                }
                const companionUser = {
                    _id: companionId,
                    profile_picture: companionProfilePicture,
                    phone_number: companionPhoneNumber,
                    name: companionName
                }
                const senderPayload = {
                    conversation_id: conversation.id,
                    ...companionUser,
                    last_message: message
                }
                global.io.to(sender.socketId).emit(UPDATE_CONVERSATION, senderPayload)

                if (!isCompanionOnline) {
                    const newMessageNotification = {
                        "notification": {
                            "title": senderName,
                            "body": new_message[lang],
                        },
                        "data": {
                            "serviceId": NEW_MESSAGE_NOTIFICATION.toString(),
                            "title": senderName,
                            "senderId": senderId,
                            "companionId": companionId,
                            "conversationId": conversation.id,
                            "body": new_message[lang],
                            "sound": 'default',
                            "click_action": 'FLUTTER_NOTIFICATION_CLICK',
                        }
                    }
                    await NotificationService.send_service_notification(companionId, newMessageNotification)
                }
            }


        })
        client.on(MARK_MESSAGE_AS_READ, (companionId) => {
            const companion = getUserById(companionId)
            if (companion) {
                client.to(companion.socketId).emit(MARK_MESSAGE_AS_READ)
            }

        })

    }


}

module.exports = new WebSockets()
