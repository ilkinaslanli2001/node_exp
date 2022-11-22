const {Schema, model, Types} = require('mongoose')
const constants = require('../constants/constant')
const OTPSchema = new Schema({
    phone_number: {type: String, required: true,},
    type: {
        type: Number,
        required: true,
        enum: {values: [constants.FORGOT_PASSWORD_OTP, constants.SIGN_UP_OTP], message: '{VALUE} is not supported'}
    },
    code: {
        type: String,
        required: true
    },
    creation_date: {
        type: Date,
        default: Date.now
    }
})
module.exports = model('OTP', OTPSchema)
