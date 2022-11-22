const constants = require('../constants/constant');
const {Schema, model} = require('mongoose')
const date = new Date()
const mongoosePaginate = require("mongoose-paginate-v2");
const UserSchema = new Schema({
    phone_number: {type: String, required: true, unique: true,},
    name: {type: String, required: true, unique: false},
    password: {type: String, required: true},
    state: {
        type: Number,
        default: constants.NOT_VERIFIED,
        enum: {
            values: [constants.NOT_VERIFIED, constants.VERIFIED, constants.WAITING_FOR_VERIFICATION],
            message: '{VALUE} is not supported'
        }

    },
    balance_id: {
        type: Number,
        required: false,
        max: 9999,
        min: 1000
    },
    block_count: {type: Number, default: 0,},
    rating: {type: [Number], required: false},
    role: {
        type: Number,
        required: true,
        default: constants.USER,
        enum: {values: [constants.USER, constants.ADMIN], message: '{VALUE} is not supported'}
    },

    car_info: {
        brand: {type: String, required: false},
        model: {type: String, required: false},
        number: {type: String, required: false},
        year: {type: Number, required: false, max: date.getFullYear()}
    },
    rate_queue: [
        String
    ],
    profile_picture: {
        type: String,
    },
    license_picture: {
        type: String,
    }
})

UserSchema.plugin(mongoosePaginate)
module.exports = model('User', UserSchema)
