const bcrypt = require('bcryptjs')
const User = require('../models/User')
const PasswordRecoveryRequest = require('../models/PasswordRecoveryRequest')
const ApiError = require('../exceptions')
const jwtService = require('../services/jwt-service')
const constants = require('../constants/constant');
const translations = require('../constants/translations');

const {checkIfUserExists} = require("../helpers/user-helpers");
require("dotenv").config({path: '../.env'})

class AuthService {
    async sign_in(phone_number, password, lang) {
        phone_number = '+994' + phone_number
        const user = await User.findOne({phone_number})
        if (!user) {
            throw  ApiError.UnauthorizedError(translations.login_error[lang])
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) throw  ApiError.UnauthorizedError(translations.login_error[lang])
        const tokens = jwtService.generateTokens({id: user.id, phone_number: user.phone_number})
        await jwtService.saveToken(user.id, tokens.refresh_token)
        return {
            ...tokens,
            id: user.id
        }
    }

    async sign_in_admin(phone_number, password) {

        phone_number = '+994' + phone_number
        const user = await User.findOne({phone_number})

        if (!user) {
            throw  ApiError.UnauthorizedError()
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch || user.role !== constants.ADMIN) throw ApiError.UnauthorizedError()

        const tokens = jwtService.generateTokens({id: user.id, phone_number: user.phone_number})

        await jwtService.saveToken(user.id, tokens.refresh_token)

        return {
            ...tokens,
            id: user.id
        }
    }

    async logout(refreshToken) {
        if (refreshToken.trim().length === 0 || !refreshToken) {
            throw  ApiError.UnauthorizedError()
        }
        await jwtService.removeToken(refreshToken)
    }

    async check_phone_number(phone_number, lang) {
        return true

    }

    async sign_up(name, phone_number, password, car_info, lang) {
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        phone_number = '+994' + phone_number
        const hashPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT))
        car_info = car_info ? JSON.parse(car_info) : null
        const user = await User.create({name, phone_number, password: hashPassword, role: constants.USER, car_info})
        return {
            id: user.id,
        }
    }

    async password_recovery_request(phoneNumber, lang) {

        const user = await User.findOne({phone_number: '+994' + phoneNumber})
        checkIfUserExists(user, lang)
        let date = new Date();
        date.setDate(date.getDate() + 1);
        date.setUTCHours(0, 0, 0, 0)
        const passwordRecovery = await PasswordRecoveryRequest.create({
            user_id: user.id,
            expiration_date: date
        })
        return {
            id: passwordRecovery.id,
        }
    }

    async password_recovery(recoveryRequestId, newPassword, lang) {
        const recoveryRequest = await PasswordRecoveryRequest.findById(recoveryRequestId)
        if (!recoveryRequest)
            throw ApiError.BadRequest('Incorrect recovery id')

        const user = await User.findById(recoveryRequest.user_id)
        checkIfUserExists(user, lang)
        user.password = await bcrypt.hash(newPassword, parseInt(process.env.PASSWORD_SALT))
        await user.save()
        return true
    }
}

module.exports = new AuthService()
