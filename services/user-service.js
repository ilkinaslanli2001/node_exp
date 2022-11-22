const fs = require('fs');
const ApiError = require('../exceptions')
const User = require('../models/User')
const CommonData = require('../models/Common')
const Ride = require('../models/Ride')
const Balance = require('../models/Balance')
const TokenModel = require('../models/Token')
const _ = require('lodash');
const constants = require('../constants/constant')
const bcrypt = require('bcryptjs')
const RequestForVerification = require('../models/RequestForVerification')
const {delete_ride} = require("../constants/translations");
const {add_date_of_delete_to_conversation} = require("../helpers/conversation-helper");
const declineCaseService = require('../services/decline-case-service')


require("dotenv").config({path: '../.env'})
const NotificationService = require('../services/notification-service')
const {password_not_match_error} = require("../constants/translations");
const {password_match_error} = require("../constants/translations");
const {addDebtToUserBalance} = require("../helpers/user-helpers");
const {FINE_FOR_DELETING_RIDE} = require("../constants/constant");
const {max_debt_text} = require("../constants/translations");
const {
    checkIfRideExists,
    checkIfRideBelongsToDriver,
    getUniquePassengers,
    checkIfRideStarted,
    add_date_of_delete_to_ride
} = require('../helpers/ride-helper')

const {
    checkIfUserExists
} = require('../helpers/user-helpers')
const {invalid_data} = require("../constants/translations");
const {rating_error} = require("../constants/translations");
const {getUserRating} = require("../helpers/user-helpers");
const {ride_started_error,} = require("../constants/translations");
const {
    ERROR, RIDE_FINISHED, SHOW_RATING_SERVICE, RIDE_WAITING,
    RIDE_IN_PROGRESS,
    DRIVER, PASSENGER
} = require("../constants/constant");
const {
    decline_ride,
} = require("../constants/translations");


class UserService {

    async me(phone_number) {

        const user = await User.findOne({phone_number})
        checkIfUserExists(user, "ru")
        const token = await TokenModel.findOne({'user': user.id})
        if (!fs.existsSync(user.profile_picture)) {
            user.profile_picture = null

            await user.save()
        }


        return {
            id: user.id,
            name: user.name,
            fcm_token: token !== null ? token.fcmToken : null,
            state: user.state,
            rating: getUserRating(user.rating),
            phone_number: user.phone_number,
            profile_picture: user.profile_picture,
            car_info: user.car_info.brand !== undefined ? user.car_info : null
        }
    }

    async get_rides_driver(driverId) {
        return Ride.find({
            userId: driverId, $or: [
                {
                    ride_state: RIDE_WAITING
                }, {ride_state: RIDE_IN_PROGRESS}
            ]
        }).select(['userId', 'departure_city', 'arrive_city', "departure_point", "arrive_point",
            'number_of_seats', 'price_for_seat', 'date_of_departure', 'ride_state',
            'time_of_departure', 'passengers', 'is_active']);
    }

    async get_passenger_rides(userId) {

        const passenger = await User.findById(userId).clone()

        for (const [index, driverId] of passenger.rate_queue.entries()) {
            const driver = await User.findById(driverId).clone().lean(true)
            passenger.rate_queue.splice(index, 1)
            if (driver) {
                const ratingMessage = {
                    "notification": {
                        "title": "Gedişinizi qiymətləndirin",
                    },
                    "data": {
                        "serviceId": SHOW_RATING_SERVICE.toString(),
                        "title": SHOW_RATING_SERVICE.toString(),
                        "passengerId": passenger.id.toString(),
                        "driverId": driverId.toString(),
                        "name": driver.name,
                        "profile_picture": driver.profile_picture == null ? '' : driver.profile_picture,
                        "sound": 'default',
                        "click_action": 'FLUTTER_NOTIFICATION_CLICK',
                    }
                }

                await NotificationService.send_service_notification(passenger.id, ratingMessage)
            }
        }


        const passengerRides = await Ride.find({
            $or: [
                {ride_state: RIDE_IN_PROGRESS},
                {ride_state: RIDE_WAITING}
            ],
            'passengers.id': {$in: [userId]},
        }).clone().select(['departure_city', 'arrive_city', "departure_point", "arrive_point",
            'number_of_seats', 'price_for_seat', 'date_of_departure',
            'time_of_departure', 'passengers', 'userId', 'ride_state']).lean()

        for (const [index, ride] of passengerRides.entries()) {
            const driver = await User.findById(ride.userId)

            passengerRides[index] = {
                ...ride,
                'driver_name': driver.name,
                'car_info': driver.car_info,
                'profile_picture': driver.profile_picture,
                'driver_rating':  getUserRating(driver.rating)
            }
        }


        return passengerRides
    }

    async change_user_settings(data) {

        const lang = data.lang || 'az'
        if (data.length < 2) {
            throw  ApiError.BadRequest('Invalid Data')
        }
        const user = await User.findById(data.id)
        if (data.name) {
            user.name = data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();
        } else if (data.current_password) {
            const isMatch = await bcrypt.compare(data.current_password, user.password)
            if (!isMatch) throw ApiError.UnprocessableEntity('Wrong data', {'password': password_not_match_error[lang]})

            if (data.current_password !== data.new_password)
                user.password = await bcrypt.hash(data.new_password, parseInt(process.env.PASSWORD_SALT))
            else throw ApiError.UnprocessableEntity('Wrong data', {'password': password_match_error[lang]})
        } else if (data.car_info) {
            user.car_info = data.car_info
        }

        await user.save()
        return true
    }

    async change_user_profile_picture(userId, profilePicture) {
        const replacedPath = profilePicture.path.replace(/\\/g, "/")
        const user = await User.findById(userId)

        // delete user previous picture
        if (user.profile_picture !== null) {
            fs.unlink(user.profile_picture, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            });
        }
        user.profile_picture = replacedPath;
        await user.save()
        return replacedPath
    }

    async request_for_verifications(userId, pictures) {
        const user = await User.findById(userId)
        if (!user)
            throw ApiError.BadRequest('Invalid user id')
        const profilePicturePath = pictures[0].path.replace(/\\/g, '/')
        const licensePicturePath = pictures[1].path.replace(/\\/g, '/')
        await RequestForVerification.create({
            user_id: userId,
            profile_picture: profilePicturePath,
            license_picture: licensePicturePath
        })
        user.state = constants.WAITING_FOR_VERIFICATION
        await user.save()
        return true
    }

    async passenger_decline_ride(user, rideId, numberOfDeclinedPlaces, blockPoint, declineCase, lang) {


        const ride = await checkIfRideExists(rideId, false)
        blockPoint = parseInt(blockPoint)
        if (blockPoint === 2) {
            await User.updateOne({_id: ride.userId.toString()}, {$inc: {block_count: 1}})
            await declineCaseService.create_decline_case(user.id, ride.userId, declineCase)
        } else if (blockPoint === 1) {
            await User.updateOne({_id: user.id}, {$inc: {block_count: 1}})
            await declineCaseService.create_decline_case(user.id, user.id, declineCase)
        }
        if (checkIfRideStarted(ride))
            throw ApiError.BadRequest(ride_started_error[lang])
        let maxNumberDeclinedPlaces = 0
        const message = {
            "notification": {
                "title": `${user.name} ${decline_ride.az}`,
                "body": `${ride.departure_city.az} - ${ride.arrive_city.az}`,
            },
            "data": {
                "title": {
                    en: `${user.name} ${decline_ride.en}`,
                    ru: `${user.name} ${decline_ride.ru}`,
                    az: `${user.name} ${decline_ride.az}`,
                },
                "body": {
                    az: `${ride.departure_city.az} - ${ride.arrive_city.az}`,
                    en: `${ride.departure_city.en} - ${ride.arrive_city.en}`,
                    ru: `${ride.departure_city.ru} - ${ride.arrive_city.ru}`,
                },
                "sound": 'default',
                "type": ERROR.toString(),
                "click_action": 'FLUTTER_NOTIFICATION_CLICK',
            }
        }


        ride.passengers.forEach((passenger, index) => {

            if (passenger.id.equals(user.id))
                maxNumberDeclinedPlaces++
        })

        if (numberOfDeclinedPlaces > maxNumberDeclinedPlaces) {
            throw ApiError.UnprocessableEntity('Wrong data', {'number_of_declined_places': invalid_data[lang]})
        }

        let passengers = ride.passengers
        let t = 0;
        for (let i = passengers.length - 1; i >= 0; i--) {
            if (passengers[i].id.equals(user.id)) {
                passengers.splice(i, 1);
                t++
            }
            if (t === numberOfDeclinedPlaces)
                break
        }
        ride.passengers = passengers
        ride.save()
        await NotificationService.send_notification(ride.userId.toString(), message)

    }

    async driver_decline_ride(driver, rideId, lang) {


        const ride = await checkIfRideExists(rideId, true)


        if (ride.passengers.length > 1) {
            await User.updateOne({id: driver.id}, {$inc: {block_count: 1}})

        }
        if (checkIfRideStarted(ride))
            throw ApiError.BadRequest(ride_started_error[lang])

        await checkIfRideBelongsToDriver(driver.id, ride.userId, "Only driver of this ride can delete ride")
        const uniquePassengers = getUniquePassengers(ride)
        uniquePassengers.forEach((passenger) => {
            const message = {
                "notification": {
                    "title": delete_ride.az,
                    "body": `${ride.departure_city.az} - ${ride.arrive_city.az}`,
                },
                "data": {
                    "title": {
                        en: `${delete_ride.en}`,
                        ru: `${delete_ride.ru}`,
                        az: `${delete_ride.az}`,
                    },
                    "body": {
                        az: `${ride.departure_city.az} - ${ride.arrive_city.az}`,
                        en: `${ride.departure_city.en} - ${ride.arrive_city.en}`,
                        ru: `${ride.departure_city.ru} - ${ride.arrive_city.ru}`,
                    },
                    "sound": 'default',
                    "type": ERROR.toString(),
                    "click_action": 'FLUTTER_NOTIFICATION_CLICK',
                }
            }
            NotificationService.send_notification(passenger.id, message)
        })
        await add_date_of_delete_to_ride(rideId, true)
        await add_date_of_delete_to_conversation(rideId)
        // add debt to user if he deletes ride
        let debt = ride.passengers.length * FINE_FOR_DELETING_RIDE * -1;
        await addDebtToUserBalance(debt, ride.userId)
        return true
    }

    async change_user_rating(passengerId, driverId, rating, lang) {
        if (passengerId === driverId) {
            throw ApiError.BadRequest(rating_error[lang])
        }

        const driver = await User.findById(driverId).clone()

        driver.rating.push(rating)

        await driver.save()
        await this.delete_rate_from_queue(passengerId, driverId)
    }

    async user_balance(userId) {
        const userBalance = await Balance.findOne({user_id: userId})
        if (!userBalance)
            throw ApiError.BadRequest('User not found')

        const user = await User.findById(userId)
        const rides = await Ride.find({
            userId,
            ride_state: RIDE_FINISHED
        }).select(['userId', 'departure_city', 'arrive_city', "departure_point", "arrive_point",
            'number_of_seats', 'price_for_seat', 'date_of_departure', 'ride_state',
            'time_of_departure', 'passengers',]).limit(25)
        // let date = new Date();
        // date.setHours(0, 0, 0, 0)

        // const weeklyRides = rides.filter((ride) => ride.date_of_departure > getDateXDaysAgo(7, date))
        // const monthlyRides = rides.filter((ride) => ride.date_of_departure > getDateXDaysAgo(30, date))
        // const threeMonthsRides = rides.filter((ride) => ride.date_of_departure > getDateXDaysAgo(90, date))
        // const halfYearRides = rides.filter((ride) => ride.date_of_departure > getDateXDaysAgo(180, date))
        // const yearlyRides = rides.filter((ride) => ride.date_of_departure > getDateXDaysAgo(365, date))


        // return {
        //     "balance": userBalance.balance,
        //     "debt_text": max_debt_text,
        //     "statistic": {
        //         "W": {
        //             total_rides: weeklyRides.length,
        //             earned: weeklyRides.reduce(function (acc, ride) {
        //                 return acc + (ride.passengers.length * ride.price_for_seat);
        //             }, 0)
        //         },
        //         "1M": {
        //             total_rides: monthlyRides.length,
        //             earned: monthlyRides.reduce(function (acc, ride) {
        //                 return acc + (ride.passengers.length * ride.price_for_seat);
        //             }, 0)
        //         },
        //         "3M": {
        //             total_rides: threeMonthsRides.length,
        //             earned: threeMonthsRides.reduce(function (acc, ride) {
        //                 return acc + (ride.passengers.length * ride.price_for_seat);
        //             }, 0)
        //         },
        //         "6M": {
        //             total_rides: halfYearRides.length,
        //             earned: halfYearRides.reduce(function (acc, ride) {
        //                 return acc + (ride.passengers.length * ride.price_for_seat);
        //             }, 0)
        //         },
        //         "1Y": {
        //             total_rides: yearlyRides.length,
        //             earned: yearlyRides.reduce(function (acc, ride) {
        //                 return acc + (ride.passengers.length * ride.price_for_seat);
        //             }, 0)
        //         },
        //     }
        // }

        return {
            "balance": userBalance.balance,
            "balance_id": user.balance_id,
            "debt_text": max_debt_text,
            "rides": rides.reverse()
        }
    }

    async delete_rate_from_queue(passengerId, driverId) {
        const user = await User.findById(passengerId)
        user.rate_queue.forEach((dId, index) => {
            if (dId === driverId)
                user.rate_queue.splice(index, 1)
        })
        user.save()
    }


}

module.exports = new UserService()
