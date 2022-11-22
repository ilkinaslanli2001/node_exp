const {Schema, model, Types} = require('mongoose')


const RequestForVerificationSchema = new Schema({
    user_id:{type:Schema.Types.ObjectId, ref: 'User'},
    profile_picture: {
        type: String,
    },
    license_picture:{
        type:String
    }
})
module.exports = model('RequestForVerification', RequestForVerificationSchema)
