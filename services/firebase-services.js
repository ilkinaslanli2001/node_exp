const admin = require('firebase-admin');
const path = require('path')
const TokenModel = require('../models/Token')
const pathToServiceAccount = path.resolve('getgel-firebase-adminsdk.json')
const serviceAccount = require(pathToServiceAccount)


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

class FirebaseServices {
    async sendPushNotification(token, message) {

        admin.messaging().sendToDevice(token, message).then((response) => {
            console.log('Successfully sent message:', response)
        })
            .catch((error) => {
                console.log('Error sending message:', error)
            })
    }
    async add_fcm_token(userId, token) {
        await TokenModel.findOneAndUpdate({user: userId}, {fcmToken: token}, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        })
        return true
    }

}

module.exports = new FirebaseServices()

