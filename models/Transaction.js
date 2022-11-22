const {Schema, model,} = require('mongoose')
const mongoosePaginate = require("mongoose-paginate-v2");
const Transaction = new Schema({

    account_number: {type: String, required: true},
    txn_id: {type: String, required: true, unique: true},
    sum: {
        type: Number, required: true
    },
    date: {type: String, required: true}
})
Transaction.plugin(mongoosePaginate)
module.exports = model('Transaction', Transaction)
