const {Schema, model, Types} = require('mongoose')
const Balance = new Schema({


    user_id: {
        type: Types.ObjectId, ref: 'User'
    },
    balance:{
        type: Number,
        default:0
    }
})
module.exports = model('Balance', Balance)
