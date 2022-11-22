const {Router} = require('express')
const otpController = require('../controllers/otp-controller')
const router = Router()
const {check} = require('express-validator')
const {FORGOT_PASSWORD_OTP, SIGN_UP_OTP} = require("../constants/constant");
const phone_number_validation = require('../middlewares/phone-number-middleware')

router.post(
    '/send',

    [phone_number_validation,
        check('type').not().isEmpty().custom((val) => {
            val = parseInt(val)
            if (val !== FORGOT_PASSWORD_OTP && val !== SIGN_UP_OTP) {
                return Promise.reject()
            }
            return true

        })],
    otpController.send)
router.post(
    '/check',

    [
        check('phone_number', "Phone number code can't be empty").not().isEmpty(),
        check('code', "OTP code can't be empty").not().isEmpty(),],
    otpController.check)

module.exports = router
