const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'})
const RideModel = require('../models/Ride')

async function deleteExpiredRides() {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true
        })
        let date = new Date();
        date.setUTCHours(0, 0, 0, 0)

        await RideModel.deleteMany({
            date_of_delete: {$lte: date}
        })

        process.exit(1)
    } catch (e) {
        console.log('Something went wrong', e.message)
        process.exit(1)
    }

}

deleteExpiredRides()
