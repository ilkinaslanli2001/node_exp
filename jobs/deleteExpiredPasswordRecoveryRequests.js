const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'})
const PasswordRecoveryRequest = require('../models/PasswordRecoveryRequest')

async function deleteExpiredRides() {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true
        })
        let date = new Date();
        date.setUTCHours(0, 0, 0, 0)

        await PasswordRecoveryRequest.deleteMany({
            expiration_date: {$lte: date}
        })

        process.exit(1)
    } catch (e) {
        console.log('Something went wrong', e.message)
        process.exit(1)
    }

}

deleteExpiredRides()
