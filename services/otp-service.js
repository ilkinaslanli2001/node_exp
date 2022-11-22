const OTP = require('../models/OTP')
const ApiError = require('../exceptions')
const axios = require('axios');
const {FORGOT_PASSWORD_OTP} = require("../constants/constant");
const {wrong_otp_error, expired_otp_error} = require("../constants/translations");
const User = require('../models/User')
const {phone_already_exists} = require("../constants/translations");
const {user_not_exists} = require("../constants/translations");

class OTPService {


    async check(phone_number, code, lang) {
        phone_number = '+994' + phone_number
        const otp = await OTP.findOne({phone_number, code})
        if (!otp) {
            throw ApiError.BadRequest(wrong_otp_error[lang])
        }
        const today = new Date();
        const diffMs = (today - otp.creation_date); // milliseconds between now & otp creation date
        const diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        if (diffMinutes > 2) {
            throw ApiError.BadRequest(expired_otp_error[lang])
        }
        return true

    }

    async send(phone_number, type, lang) {
        lang = lang ?? 'az'
        phone_number = '+994' + phone_number

        const user = await User.findOne({phone_number})

        type = parseInt(type)

        if (type === FORGOT_PASSWORD_OTP) {
            if (!user) {
                throw ApiError.BadRequest(user_not_exists[lang])
            }
        } else {
            if (user) {
                throw ApiError.BadRequest(phone_already_exists[lang])
            }
        }
        const code = Math.floor(100000 + Math.random() * 900000)

        await OTP.updateOne({
            phone_number
        }, {type: parseInt(type), code, creation_date: new Date()}, {upsert: true})
        process.env.NODE_ENV === "PRODUCTION" ? await axios.post('https://www.poctgoyercini.com/api_json/v1/Sms/Send_1_N', {
            "Message": `Sizin birdəfəlik şifrəniz (OTP) ${code}.\nGetGəl-i seçdiyiniz üçün təşəkkürlər!`,
            "Receivers": [
                phone_number
            ],

            "Username": "getgel456_servis",
            "Password": "getgel456"
        }) : console.log(code)
        return true

    }
}

module.exports = new OTPService()
