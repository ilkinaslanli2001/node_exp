const {Schema, model} = require('mongoose')

const PasswordRecoveryRequest = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    expiration_date: {
        type: Date,
        required: true
    },
})
module.exports = model('PasswordRecoveryRequest', PasswordRecoveryRequest)
