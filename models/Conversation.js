const {Schema, model, Types} = require('mongoose')
const Conversation = new Schema({

    members: {
        type: Array
    },
    ride_id: {
        type: Types.ObjectId, ref: 'Ride'
    },
    date_of_delete: {
        type: Date,
        required: false
    }

})
module.exports = model('Conversation', Conversation)
