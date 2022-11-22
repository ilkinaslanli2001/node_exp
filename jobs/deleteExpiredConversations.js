const mongoose = require("mongoose");
require('dotenv').config({path: '../.env'})
const Conversation = require('../models/Conversation')

async function deleteExpiredConversations() {
    try {

        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true
        })
        let date = new Date();
        date.setUTCHours(0, 0, 0, 0)

        await Conversation.deleteMany({
            date_of_delete: {$lte: date}
        })

        process.exit(1)
    } catch (e) {
        console.log('Something went wrong', e.message)
        process.exit(1)
    }

}

deleteExpiredConversations()
