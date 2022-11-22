const {Schema, model} = require('mongoose')

const TokenSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    refreshToken: {type: String, required: true},
    fcmToken: {type: String, required: false}
})
module.exports = model('Token', TokenSchema)
