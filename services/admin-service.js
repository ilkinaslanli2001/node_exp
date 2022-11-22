const User = require("../models/User")
const Ride = require("../models/Ride")
const Token = require("../models/Token")
const Transaction = require("../models/Transaction")
const RequestForVerification = require("../models/RequestForVerification")
const fs = require("fs")
const ApiError = require("../exceptions")
const {sendDriverAcceptNotification} = require("../helpers/notification-helper");
const {NOTIFICATION_FROM_ADMIN_SERVICE} = require("../constants/constant")
const {createBalance} = require("../helpers/user-helpers")
const {
    ACCEPT,
    REJECT,
    VERIFIED,
    NOT_VERIFIED,
} = require("../constants/constant")
const {sendPushNotification} = require("../services/firebase-services")

class AdminService {

    async search_users(searchQuery, onlyDrivers, currentPage) {
        let result = []
        let query = {}
        if (searchQuery) {
            query = {
                // if searchQuery has numbers then search by phone number else search by name
                .../\d/.test(searchQuery) ? {phone_number: {$regex: searchQuery}} : {
                    name: {
                        $regex: searchQuery.charAt(0).toUpperCase() +
                            searchQuery.slice(1).toLowerCase()
                    }
                }
            }
        }
        query = {
            ...query, ...onlyDrivers ? {
                license_picture: {$exists: true, $ne: null},
            } : undefined
        }
        result = await User.paginate(query, {
            page: currentPage,
            limit: 10,
            lean: true,
            sort: {_id: -1},
        })
        return {
            result: result.docs,
            total_users: result.totalDocs,
            total_pages: result.totalPages,
            current_page: result.page,
        }
    }

    async get_requests_for_verification() {
        let requests_info = []
        let requests
        requests = await RequestForVerification.find((err, requests) => {
            if (err) return err
            return requests
        })
            .clone()
            .lean()
        for (let request of requests) {
            const user = await User.findById(request.user_id).select("phone_number")
            if (!user) {
                await RequestForVerification.findByIdAndDelete(request._id)
            } else {
                requests_info.push({...request, phone_number: user.phone_number})
            }
        }

        return requests_info
    }

    async request_for_verifications(request_id, type) {

        const request = await RequestForVerification.findById(request_id)
        const user = await User.findById(request.user_id)

        if (type === ACCEPT) {
            user.profile_picture = request.profile_picture
            user.license_picture = request.license_picture
            user.state = VERIFIED
            user.balance_id = Math.floor(1000 + Math.random() * 9000)

            await sendDriverAcceptNotification(user._id.toString())
            await createBalance(request.user_id)

        } else if (type === REJECT) {
            // ToDo send notification about rejection
            user.state = NOT_VERIFIED
            fs.unlink(request.profile_picture, function (err) {
                if (err) throw err
                // if no error, file has been deleted successfully
                console.log("File deleted!")
            })
            fs.unlink(request.license_picture, function (err) {
                if (err) throw err
                // if no error, file has been deleted successfully
                console.log("File deleted!")
            })
        }
        await user.save()
        await RequestForVerification.findByIdAndDelete(request.id)
        return true
    }

    async get_or_edit_user_info(userId, userInfo) {
        const user = await User.findById(userId)
        if (userInfo) {
        }
        return user
    }

    async get_rides(rideState, currentPage) {


        return await Ride.paginate({
            ...rideState !== null ? {
                ride_state: rideState
            } : null
        }, {
            page: currentPage,
            limit: 10,
            lean: true,
            sort: {_id: -1},
        }).then(async (res) => {
            let rides = res.docs
            for (const [index, ride] of rides.entries()) {
                const driver = await User.findById(ride.userId)

                rides[index] = {
                    ...ride,
                    driver_name: driver ? driver.name : "Deleted user",
                    car_info: driver ? driver.car_info : "Deleted user",
                    driver_phone: driver ? driver.phone_number : "Deleted user",
                }
            }
            return {
                rides,
                total_pages: res.totalPages
            }
        })

    }

    async get_transactions(accountNumber, currentPage) {
        return await Transaction.paginate({
            ...accountNumber !== null ? {
                account_number: {$regex: accountNumber}
            } : null
        }, {
            page: currentPage,
            limit: 20,
            lean: true,
            sort: {_id: -1},
        }).then(async (res) => {
            let transactions = res.docs
            return {
                transactions,
                total_pages: res.totalPages
            }
        })
    }

    async send_notification(title, body, userType, phoneNumber) {
        let users = []
        let fcmTokens = []
        const message = {
            notification: {
                title: title,
                body: body,
            },

            data: {
                serviceId: NOTIFICATION_FROM_ADMIN_SERVICE.toString(),
                sound: "default",
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
        }
        if (userType === 0) {
            users = await User.find().sort({_id: -1})
        } else if (userType === 1) {
            users = await User.find({license_picture: {$exists: false}}).sort({
                _id: -1,
            })
        } else if (userType === 2) {
            users = await User.find({
                license_picture: {$ne: null, $exists: true},
            }).sort({_id: -1})
        } else
            throw ApiError.UnprocessableEntity("Invalid Data", {
                "user type": "Invalid format",
            })
        for (const user of users) {
            const tokenData = await Token.findOne({user: user._id})
            if (tokenData?.fcmToken) {
                fcmTokens.push(tokenData.fcmToken)
            }
        }

        if (fcmTokens.length > 0) {
            await sendPushNotification(fcmTokens, message)
        }
        return true
    }

    async edit_ride_info(rideId, editedRide) {
        const ride = await Ride.findById(rideId).lean(false)

        ride.ride_state = editedRide.ride_state ?? ride.ride_state
        ride.time_of_departure = editedRide.time_of_departure ?? ride.time_of_departure
        ride.features_of_ride = {
            ...ride.features_of_ride,
            ...editedRide.features_of_ride ? editedRide.features_of_ride : undefined
        }
        ride.price_for_seat = editedRide.price_for_seat ?? ride.price_for_seat
        await ride.save()

        return ride
    }

}

module.exports = new AdminService()
