const {Schema, model, Types} = require('mongoose')
const constants = require('../constants/constant')
const mongoosePaginate = require("mongoose-paginate-v2");
const RideSchema = new Schema({
    ride_state: {
        type: Number,
        enum: [constants.RIDE_WAITING, constants.RIDE_IN_PROGRESS, constants.RIDE_FINISHED, constants.RIDE_DELETED],
        default: constants.RIDE_WAITING,
        required: false

    },
    userId: {
        type: Types.ObjectId, ref: 'User'
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
    features_of_ride: {
        type: Object,
        required: true
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

    price_for_seat: {
        type: Number,
        min: 1,
        max: 100,
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
    passengers: [{
        id: {type: Types.ObjectId, ref: 'User'},
        paymentType: {
            type: Number,
            required: true,
            enum: {values: [constants.CASH, constants.CARD], message: '{VALUE} is not supported'}
        },
    }]

})
RideSchema.plugin(mongoosePaginate)
module.exports = model('Ride', RideSchema)
