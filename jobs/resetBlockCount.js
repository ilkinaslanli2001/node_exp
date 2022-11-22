const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'})
const User = require('../models/User')

async function resetBlockCount() {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true
        })


        await User.updateMany({}, {block_count: 0}, {multi: true})

        process.exit(1)
    } catch (e) {
        console.log('Something went wrong', e.message)
        process.exit(1)
    }

}

resetBlockCount()
