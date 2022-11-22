const CommonData = require("../models/Common")
const NotificationService = require("../services/notification-service");
const ApiError = require("../exceptions");
const {SUCCESS} = require("../constants/constant");
const sendDriverAcceptNotification = async (driverId) => {
    const commonData = await CommonData.findOne({
        key: 'other_data',
    }).select("data")


    const acceptDriverNotification = commonData.data?.accept_driver_notification
    if (!acceptDriverNotification)
        throw ApiError.BadRequest("Invalid Data", {
            "accept_driver_notification": "There is no 'accept_driver_notification'. Create it first in 'Other Data' and try one more time ",
        })
    const message = {
        "notification": {
            "title": acceptDriverNotification.title.az,
            "body": acceptDriverNotification.body.az,
        },
        "data": {
            "title": acceptDriverNotification.title,
            "body": acceptDriverNotification.body,
            "sound": 'default',
            "type": SUCCESS.toString(),
            "click_action": 'FLUTTER_NOTIFICATION_CLICK',
        }
    }

    await NotificationService.send_notification(driverId, message)
}
module.exports = {
    sendDriverAcceptNotification
}
