const ApiError = require("../exceptions");
const {user_not_exists} = require("../constants/translations");
const Balance = require('../models/Balance')
const User = require('../models/User')
const {COMMISSION} = require("../constants/constant");

const checkIfUserExists = (user, lang) => {
    if (!user)
        throw ApiError.BadRequest(user_not_exists[lang])
    return true
}
const getUserRating = (rating) => {
    return rating.length === 0 ? 0 : (rating.reduce((a, b) => a + b, 0) / rating.length).toFixed(1)
}
const getUserBySocketId = (socket) => {
    const user = global.onlineUsers.find((user) => user.socketId === socket.id)

    return user ? user.userId : null
}
const getUserById = (userId) => {
    return global.onlineUsers.find((user) => user.userId === userId)
}
const addDebtToUserBalance = async (debt, userId) => {

    const userBalance = await Balance.findOne({user_id: userId})
    if (userBalance) {
        const totalBalance = userBalance.balance + debt
        await Balance.findOneAndUpdate({user_id: userId}, {balance: totalBalance.toFixed(2)}, {upsert: true})
    } else {
        await Balance.findOneAndUpdate({user_id: userId}, {$inc: {balance: debt.toFixed(2)}}, {upsert: true})
    }
}


const getUserByAccountNumber = async (account) => {
    account = account.split('||')
    let phoneNumber = '+994' + account[0]
    let balanceId = account[1]
    return User.findOne({phone_number: phoneNumber, balance_id: parseInt(balanceId)});
}
const createBalance = async (userId) => {
    await Balance.create({user_id: userId})
}
module.exports = {
    checkIfUserExists,
    getUserRating,
    getUserBySocketId,
    getUserById,
    createBalance,
    addDebtToUserBalance,
    getUserByAccountNumber
}
