const {Schema, model, Types} = require('mongoose')
const constants = require('../constants/constant')
const FAQSchema = new Schema({
    type: {
        type: Number,
        required: true,
        enum: {values: [constants.PASSENGER, constants.DRIVER], message: '{VALUE} is not supported'}
    },
    question: {
        az: {
            type: String,
            required: true
        },
        ru: {
            type: String,
            required: true
        },
        en: {
            type: String,
            required: true
        }
    },
    answer: {
        az: {
            type: String,
            required: true
        },
        ru: {
            type: String,
            required: true
        },
        en: {
            type: String,
            required: true
        }
    }
})
module.exports = model('FAQ', FAQSchema)
