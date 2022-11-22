const {Schema, model, Types} = require('mongoose')
const Notification = new Schema({

    user_id: {
        type: Types.ObjectId, ref: 'User'
    },
    title: {
        az: {type: String, required: true},
        en: {type: String, required: true},
        ru: {type: String, required: true},
    },
    body: {
        az: {type: String, required: true},
        en: {type: String, required: true},
        ru: {type: String, required: true},
    },
    data: {
        type: Object,
        required: false,
    },
    type: {
        type: Number,
        min: 1,
        max: 4,
        default: 1
    },
    is_read: {type: Boolean, default: false},

    date: {type: String, required: false, default: Date.now},
})
module.exports = model('Notification', Notification)
