const {Schema, model, Types} = require('mongoose')
const constants = require('../constants/constant')
const mongoosePaginate = require("mongoose-paginate-v2");
const PassengerOrder = new Schema({
    ride_state: {
        type: Number,
        enum: [constants.PASSENGER_ORDER_WAITING, constants.PASSENGER_ORDER_ACCEPTED, constants.PASSENGER_ORDER_DELETED],
        default: constants.PASSENGER_ORDER_WAITING,
        required: false

    },
    user_id: {
        type: Types.ObjectId, ref: 'User'
    },
    ride_id:{
        required:false,
        type: Types.ObjectId, ref: 'Ride'
    },
    departure_city: {
        type: Object,
        required: true,
    },
    departure_point: {
        type: Object,
        required: true,
    },
    arrive_city: {
        type: Object,
        required: true,
    },
    arrive_point: {
        type: Object,
        required: true,
    },
    description: {
        type: String,
        required: false,
        maxLength: 1024,
    },
    number_of_seats: {
        type: Number,
        min: 1,
        max: 20
    },
    time_of_departure: {
        type: String,
        required: true,
    },
    date_of_departure: {
        type: Date,
        required: false
    },
    date_of_delete: {
        type: Date,
        required: false
    },
    is_active: {
        type: Boolean,
        required: false,
        default: true
    },
    drivers_queue: [{
        id: {type: Types.ObjectId, ref: 'User'},

    }]

})
PassengerOrder.plugin(mongoosePaginate)
module.exports = model('PassengerOrder', PassengerOrder)
