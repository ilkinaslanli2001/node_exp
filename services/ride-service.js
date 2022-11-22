const ApiError = require("../exceptions");
const moment = require('moment/moment')
const User = require('../models/User')
const Ride = require('../models/Ride')
const Balance = require('../models/Balance')
const CommonService = require('../services/common-services')
const {add_passenger} = require("../constants/translations");
const _ = require('lodash');
const {invalid_date} = require("../constants/translations");
const {add_date_of_delete_to_conversation} = require("../helpers/conversation-helper");
const {max_ride_count} = require("../constants/translations");
const {CASH} = require("../constants/constant");
const {all_seats_busy_error} = require("../constants/translations");
const {invalid_data} = require("../constants/translations");
const {ride_not_exist_error} = require("../constants/translations");
const {getUserRating} = require("../helpers/user-helpers");
const NotificationService = require("../services/notification-service");
const {max_debt_limit} = require("../constants/translations");
const {MAX_DEBT} = require("../constants/constant");
const {addDebtToUserBalance} = require("../helpers/user-helpers");
const {have_ride_as_passenger_error} = require("../constants/translations");
const {have_ride_as_driver_error} = require("../constants/translations");
const declineCaseService = require('../services/decline-case-service')
const {COMMISSION} = require("../constants/constant");
const {ERROR} = require("../constants/constant");
const {delete_passenger_from_ride} = require("../constants/translations");
const {SUCCESS, RIDE_IN_PROGRESS, SHOW_RATING_SERVICE, RIDE_WAITING} = require("../constants/constant");
const {ride_started, ride_started_error} = require("../constants/translations");
const {
    checkIfRideExists,
    checkIfRideBelongsToDriver,
    getUniquePassengers,
    checkIfRideStarted,
    add_date_of_delete_to_ride,
    checkRideTime

} = require('../helpers/ride-helper')

class RideService {
    async start_ride(driverId, rideId, lang) {

        const ride = await checkIfRideExists(rideId, false)
        await checkIfRideBelongsToDriver(driverId, ride.userId, "Only driver can start ride")
        if (checkIfRideStarted(ride))
            throw ApiError.BadRequest(ride_started_error["ru"])
        const uniquePassengers = getUniquePassengers(ride)
        uniquePassengers.forEach((passenger) => {
            const message = {
                "notification": {
                    "title": `${ride.departure_city.az} - ${ride.arrive_city.az}`,
                    "body": ride_started.az,
                },
                "data": {
                    "title": {
                        az: `${ride.departure_city.az} - ${ride.arrive_city.az}`,
                        en: `${ride.departure_city.en} - ${ride.arrive_city.en}`,
                        ru: `${ride.departure_city.ru} - ${ride.arrive_city.ru}`,
                    },
                    "body": ride_started,
                    "sound": 'default',
                    "type": SUCCESS.toString(),
                    "click_action": 'FLUTTER_NOTIFICATION_CLICK',
                }
            }

            NotificationService.send_notification(passenger.id, message)
        })
        ride.ride_state = RIDE_IN_PROGRESS
        await ride.save()
        return true
    }

    async finish_ride(driverId, rideId, lang) {

        const ride = await checkIfRideExists(rideId, false)

        await checkIfRideBelongsToDriver(driverId, ride.userId, "Only driver can start ride")
        if (!checkIfRideStarted(ride))
            throw ApiError.BadRequest(ride_started_error[lang])

        const uniquePassengers = getUniquePassengers(ride)
        const driver = await User.findById(driverId).clone().lean(true)
        for (const passenger of uniquePassengers) {
            const user = await User.findById(passenger.id)
            user.rate_queue.push(driverId)
            await user.save()

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

        await add_date_of_delete_to_ride(rideId)
        await add_date_of_delete_to_conversation(rideId)
        let debt = ride.passengers.length * ride.price_for_seat * COMMISSION / 100 * -1;
        await addDebtToUserBalance(debt, ride.userId)
        return true
    }


    async add_ride(driver, data) {
        const userBalance = await Balance.findOne({user_id: data.id})
        if (userBalance) {
            if (userBalance.balance <= MAX_DEBT * -1)
                throw ApiError.BadRequest(max_debt_limit[data.lang])
        }
        const ridesAsDriver = await Ride.find({userId: driver.id, date_of_delete: null}).clone()
        const ridesAsPassenger = await Ride.find({'passengers.id': {$in: [driver.id]}, date_of_delete: null})
        if (ridesAsPassenger.length > 0) {
            throw ApiError.BadRequest(have_ride_as_passenger_error[data.lang])
        }

        if (ridesAsDriver.length >= 2) {
            throw ApiError.BadRequest(max_ride_count[data.lang])
        }
        let add_ride_data = {
            userId: null,
            departure_city: null,
            arrive_city: null,
            departure_point: null,
            arrive_point: null,
            number_of_seats: null,
            price_for_seat: null,
            features_of_ride: null,
            description: null,
            date_of_departure: null,
            time_of_departure: null
        }

        const cities = await CommonService.get_data('cities')
        for (const [key, city_data] of Object.entries(cities.data)) {

            if (_.isEqual(data['departure_city'], city_data['city_names'])) {
                add_ride_data.departure_city = data['departure_city']
                for (const [key, value] of Object.entries(city_data['places'])) {

                    if (_.isEqual(data['departure_point'], value))
                        add_ride_data.departure_point = value
                }
            }
            if (_.isEqual(data['arrive_city'], city_data['city_names'])) {
                add_ride_data.arrive_city = data['arrive_city']
                for (const [key, value] of Object.entries(city_data['places'])) {

                    if (_.isEqual(data['arrive_point'], value))
                        add_ride_data.arrive_point = value
                }
            }
        }
        if (data.description) {
            if (data.description.trim().length === 0) {
                add_ride_data.description = null
            } else if (data.description.trim().length < 3) {
                throw  ApiError.UnprocessableEntity('Data is not valid', {'description': 'Invalid description'})
            }
        }
        if (!checkRideTime(data.date_of_departure, data.time_of_departure)) {
            throw  ApiError.UnprocessableEntity('Data is not valid', {'arrive_city': invalid_date[data.lang]})
        }
        add_ride_data.description = data.description
        add_ride_data.number_of_seats = data.number_of_seats
        add_ride_data.userId = data.id
        add_ride_data.price_for_seat = data.price_for_seat
        add_ride_data.features_of_ride = data.features
        add_ride_data.date_of_departure = data.date_of_departure
        add_ride_data.time_of_departure = data.time_of_departure
        if (!add_ride_data.arrive_city) {
            throw  ApiError.UnprocessableEntity('Data is not valid', {'arrive_city': 'Arrive city is wrong'})
        }
        if (!add_ride_data.departure_city) {
            throw  ApiError.UnprocessableEntity('Data is not valid', {'departure_city': 'Departure city is wrong'})
        }
        if (!add_ride_data.departure_point) {
            throw  ApiError.UnprocessableEntity('Data is not valid', {'departure_point': 'Departure Point is wrong'})
        }
        if (!add_ride_data.arrive_point) {
            throw  ApiError.UnprocessableEntity('Data is not valid', {'arrive_point': 'Arrive Point is wrong'})
        }
        if (_.isEqual(add_ride_data.arrive_city, add_ride_data.departure_city))
            throw  ApiError.UnprocessableEntity('Data is not valid', {'arrive_city': 'Arrive city doesnt have to be same as departure point'})
        await Ride.create(add_ride_data)
        return true
    }

    async search_rides(arrive_city, departure_city, limit, offset, filterOptions) {

        let rides = []
        const selectFromRide = ['departure_city', 'arrive_city', "departure_point", "arrive_point",
            'number_of_seats', 'price_for_seat', 'date_of_departure',
            'time_of_departure', 'passengers', 'userId', 'ride_state']
        const query = {
            ride_state: RIDE_WAITING,
            date_of_departure: {
                $gte: new Date().setUTCHours(0, 0, 0, 0),
            },
            price_for_seat: {
                $gte: filterOptions.min_price, $lte: filterOptions.max_price,
            },
            time_of_departure: {
                $in: filterOptions.times
            },
            ...filterOptions.date_of_departure ? {
                date_of_departure: filterOptions.date_of_departure
            } : undefined,
            is_active: true,
            ...arrive_city && departure_city ? {
                arrive_city: arrive_city,
                departure_city: departure_city,
            } : null,
        }
        rides = await Ride.find(query).select(selectFromRide)
            .clone().lean(true).sort('date_of_departure')
        // filter rides by number of empty seats
        let filteredRides = rides.filter((item) => {
            return filterOptions.number_of_empty_seats <= item.number_of_seats - item.passengers.length
        })


        filteredRides = filteredRides.slice(offset, offset + limit)
        //get driver info
        for (let [index, ride] of filteredRides.entries()) {

            const driver = await User.findById(ride.userId).select(['name', 'car_info', 'profile_picture', 'rating'])
            ride = {
                ...ride,
                'driver_name': driver.name,
                'car_info': driver.car_info,
                'profile_picture': driver.profile_picture,
                'driver_rating': getUserRating(driver.rating)
            }
            filteredRides[index] = ride

        }
        return {
            result: filteredRides,
            total_count: rides.length
        }
    }


    async add_passenger_to_ride(rideId, user, numberOfSeats, lang) {

        // if rideId is incorrect
        const ride = await checkIfRideExists(rideId, false)
        if (checkIfRideStarted(ride)) {
            throw ApiError.BadRequest(ride_started_error[lang])
        }
        if (!ride) {
            throw ApiError.BadRequest(ride_not_exist_error[lang])
        }
        if (ride.userId === user.id) {
            throw ApiError.UnprocessableEntity(invalid_data[lang])
        }

        if (ride.passengers.length !== 0) {
            //if all places are occupied
            if (ride.passengers.length >= ride.number_of_seats) {
                throw ApiError.UnprocessableEntity(all_seats_busy_error[lang])
            }
            if (numberOfSeats > ride.number_of_seats - ride.passengers.length) {
                throw ApiError.UnprocessableEntity(invalid_data[lang])
            }

        }

        const ridesAsDriver = await Ride.find({userId: user.id, date_of_delete: null}).clone()
        const ridesAsPassenger = await Ride.find({'passengers.id': {$in: [user.id]}, date_of_delete: null}).clone()
        if (ridesAsDriver.length > 0) {
            throw ApiError.BadRequest(have_ride_as_driver_error[lang])
        }
        if (ridesAsPassenger.length > 2) {

            throw ApiError.BadRequest(max_ride_count[lang])
        }
        let passenger = {
            id: user.id.toString(),
            paymentType: CASH
        }
        for (let n = 0; n < numberOfSeats; n++) {
            ride.passengers.push(passenger)
        }

        const message = {
            "notification": {
                "title": `${user.name} ${add_passenger.az}`,
                "body": `${ride.arrive_city.az} - ${ride.departure_city.az}`,
            },
            "data": {
                "title": {
                    en: `${user.name} ${add_passenger.en}`,
                    ru: `${user.name} ${add_passenger.ru}`,
                    az: `${user.name} ${add_passenger.az}`,
                },
                "body": {
                    az: `${ride.arrive_city.az} - ${ride.departure_city.az}`,
                    en: `${ride.arrive_city.en} - ${ride.departure_city.en}`,
                    ru: `${ride.arrive_city.ru} - ${ride.departure_city.ru}`,
                },
                "sound": 'default',
                "type": SUCCESS.toString(),
                "click_action": 'FLUTTER_NOTIFICATION_CLICK',
            }
        }

        await NotificationService.send_notification(ride.userId.toString(), message)

        await ride.save()

        return true
    }

    async get_ride_info(rideId, checkForDelete = true) {

        let ride = await checkIfRideExists(rideId, true, checkForDelete)

        let features_of_ride = await CommonService.get_data('features_of_ride')
        features_of_ride = features_of_ride.data
        const driver = await User.findById(ride.userId, (err, user) => {
            if (err) {
                throw ApiError.BadRequest('Something went wrong')
            } else return user
        }).clone().lean(true)

        let passengers = []
        for (const data of ride.passengers) {

            const passenger = await User.findById(data.id).select(['name', 'profile_picture', 'phone_number'])
            passengers.push({
                ...data,
                name: passenger.name,
                profile_picture: passenger.profile_picture,
                phone_number: passenger.phone_number
            })
        }
        let features_with_translation = []
        Object.keys(ride.features_of_ride).forEach((key, index) => {
            if (features_of_ride[key]) {
                features_with_translation.push({
                    [key]: {
                        ...features_of_ride[key],
                        value: ride.features_of_ride[key]
                    }
                })
            }

        })

        let date = new Date();
        date.setUTCHours(0, 0, 0, 0)
        ride.features_of_ride = features_with_translation
        ride.passengers = passengers
        ride = Object.assign({}, ride, {
            'car_info': driver.car_info,
            'driver_name': driver.name,
            'profile_picture': driver.profile_picture,
            "driver_phone_number": driver.phone_number,
            "driver_rating": getUserRating(driver.rating),
            "is_expired": moment(ride.date_of_departure).isBefore(date)
        })

        return ride
    }

    //When driver deletes passenger from ride
    async delete_passenger_from_ride(driverId, passengerId, rideId, blockPoint, declineCase, lang) {
        const ride = await checkIfRideExists(rideId, false)

        if (checkIfRideStarted(ride))
            throw ApiError.BadRequest(ride_started_error[lang])
        await checkIfRideBelongsToDriver(driverId, ride.userId, "You are not the driver of this ride")
        blockPoint = parseInt(blockPoint)
        if (blockPoint === 2) {
            await User.updateOne({_id: passengerId}, {$inc: {block_count: 1}})
            await declineCaseService.create_decline_case(ride.userId, passengerId, declineCase)
        } else if (blockPoint === 1) {
            await User.updateOne({_id: ride.userId}, {$inc: {block_count: 1}})
            await declineCaseService.create_decline_case(ride.userId, ride.userId, declineCase)
        }

        ride.passengers = ride.passengers.filter((passenger) => passenger.id.toString() !== passengerId)
        await ride.save()
        const message = {
            "notification": {
                "title": delete_passenger_from_ride.az,
                "body": `${ride.arrive_city.az} - ${ride.departure_city.az}`,
            },
            "data": {
                "title": {
                    en: delete_passenger_from_ride.az,
                    ru: delete_passenger_from_ride.ru,
                    az: delete_passenger_from_ride.az,
                },
                "body": {
                    az: `${ride.arrive_city.az} - ${ride.departure_city.az}`,
                    en: `${ride.arrive_city.en} - ${ride.departure_city.en}`,
                    ru: `${ride.arrive_city.ru} - ${ride.departure_city.ru}`,
                },
                "sound": 'default',
                "type": ERROR.toString(),
                "click_action": 'FLUTTER_NOTIFICATION_CLICK',
            }
        }
        await NotificationService.send_notification(passengerId, message)
        return true
    }

    async set_ride_active_state(userId, rideId, state, lang) {
        let ride = await checkIfRideExists(rideId, false)
        await checkIfRideBelongsToDriver(userId, ride.userId, "Only driver of this ride can change the ride's state")
        ride.is_active = state
        await ride.save()
        return true
    }

}

module.exports = new RideService()
