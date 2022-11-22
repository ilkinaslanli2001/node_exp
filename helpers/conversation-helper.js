const Conversation = require('../models/Conversation')
const get_conversation_info = async (userId, companionId) => {
    return Conversation.findOne({
        members: {$in: [[companionId, userId], [userId, companionId]]},
        date_of_delete: null
    });
}
const add_date_of_delete_to_conversation = async (ride_id) => {
    let date = new Date();
    date.setDate(date.getMonth() + 3);
    date.setHours(0, 0, 0, 0)
    await Conversation.updateMany({ride_id}, {$set: {date_of_delete: date}})
}


module.exports = {
    get_conversation_info,
    add_date_of_delete_to_conversation
}


