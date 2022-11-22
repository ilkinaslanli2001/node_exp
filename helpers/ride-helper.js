const ApiError = require("../exceptions");
const Ride = require('../models/Ride')
const {RIDE_FINISHED} = require("../constants/constant");
const {RIDE_WAITING, RIDE_DELETED} = require('../constants/constant')
const moment = require('moment/moment')

checkIfRideExists = async (rideId, isLean, checkForDelete) => {
    const ride = isLean ? await Ride.findById(rideId).lean().clone() : await Ride.findById(rideId).clone()
    if (!ride)
        throw ApiError.BadRequest('Ride is not found')
    if (checkForDelete)
        if (ride.date_of_delete)
            throw ApiError.BadRequest('Ride is not found')
    return ride
}

checkIfRideBelongsToDriver = async (userId, driverId, text) => {
    if (driverId.toString() !== userId)
        throw ApiError.BadRequest(text)
}
getUniquePassengers = (ride) => {
    const uniqueIds = [];
    return ride.passengers.filter(passenger => {
        const isDuplicate = uniqueIds.includes(passenger.id.toString());
        if (!isDuplicate) {
            uniqueIds.push(passenger.id.toString());
            return true;
        }
    });
}
checkRideTime = (date, time) => {

    const now = moment()
    const dateFormat = 'YYYY-MM-DD';
    const userTimeStart = moment(`${date} ${time.split('-')[0]}`, "YYYY-MM-DD HH:mm")
    const userDate = moment(date).format(dateFormat)

    if (moment(userDate, dateFormat).isAfter(now.format(dateFormat)))
        return true
    if (moment(userDate).isSame(now.format(dateFormat))) {
        return now.isBefore(userTimeStart) || now.isSame(userTimeStart)
    }
    if (moment(userDate).isBefore(now.format(dateFormat))) {

        return false
    }
    return false

}
checkIfRideStarted = (ride) => {
    return ride.ride_state !== RIDE_WAITING;
}
add_date_of_delete_to_ride = async (rideId, isDeleted = false) => {

    let date = new Date();
    date.setDate(date.getMonth() + 3);
    date.setHours(0, 0, 0, 0)
    await Ride.findByIdAndUpdate(rideId, {date_of_delete: date, ride_state: isDeleted ? RIDE_DELETED : RIDE_FINISHED})


}

function getDateXDaysAgo(numOfDays, date = new Date()) {
    const daysAgo = new Date(date.getTime());

    daysAgo.setDate(date.getDate() - numOfDays);

    return daysAgo;
}

module.exports = {
    checkIfRideExists,
    checkIfRideBelongsToDriver,
    getUniquePassengers,
    checkIfRideStarted,
    add_date_of_delete_to_ride,
    checkRideTime,
    getDateXDaysAgo

}
