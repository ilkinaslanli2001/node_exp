const Notification = require('../models/Notification')
const User = require('../models/User')
const TokenModel = require('../models/Token')
const {sendPushNotification} = require("../services/firebase-services");

class NotificationService {
    async make_notifications_read(userId) {
        return Notification.updateMany({user_id: userId}, {is_read: true});
    }

    async get_user_notifications(userId) {
        const notifications = await Notification.find({user_id: userId})
        return notifications.reverse()
    }

    async send_notification(userId, message) {
        const userToken = await TokenModel.findOne({'user': userId})

        await this.add_notification(userId, message.data.title,
            message.data.body,
            parseInt(message.data.type)
        )
        message.data.title = message.data.title.az
        message.data.body = message.data.body.az
        if (userToken?.fcmToken)
            await sendPushNotification(userToken.fcmToken, message)

    }

    async add_notification(userId, title, body, type) {
        const notifications = await Notification.find({user_id: userId})
        if (notifications.length > 20) {
            await Notification.findByIdAndDelete(notifications[0].id)
        }
        await Notification.create({
            user_id: userId,
            title,
            body,
            type
        })

        return true
    }

    async send_service_notification(userId, message) {
        const passengerToken = await TokenModel.findOne({'user': userId})
        if (passengerToken)
            await sendPushNotification(passengerToken.fcmToken, message)
    }

}

module.exports = new NotificationService()
