const {Schema, model, Types} = require('mongoose')
const DeclineCase = new Schema({

    from: {
        type: Types.ObjectId, ref: 'User',
        required: true
    },
    to: {
        type: Types.ObjectId, ref: 'User',
        required: true
    },

    case: {
        type: Number,
        required: true
    },
})
module.exports = model('DeclineCase', DeclineCase)
