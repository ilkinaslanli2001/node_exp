const {Schema, model, Types} = require('mongoose')
const Message = new Schema({

    conversation_id: {
        type: Types.ObjectId, ref: 'Conversation'
    },
    sender_id: {
        type: Types.ObjectId, ref: 'User'
    },
    data: {
        type: Object,
        required: true,
    },
    is_read: {type: Boolean, default: false},

    date: {type: String, required: false, default: Date.now},
})
module.exports = model('Message', Message)
