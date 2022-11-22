const {Router} = require('express')
const authController = require('../controllers/auth-controller')
const router = Router()
const {check} = require('express-validator')
const phone_number_validation = require('../middlewares/phone-number-middleware')
// /api/app/auth/sign_in



router.post(
    '/signin',

    [check('phone_number', "Phone number can't be empty").not().isEmpty(),
        check('password', "Password should contain at least 8 characters").isLength({min: 8})],
    authController.sign_in)
router.post(
    '/password-recovery-request',

    [check('phone_number', "Phone number can't be empty").not().isEmpty(),],
    authController.password_recovery_request)
router.post(
    '/password-recovery',

    [check('password', "Password should contain at least 8 characters").isLength({min: 8})],
    authController.password_recovery)
// /api/app/auth/sign_up
router.post('/signup', [check('phone_number', "Phone number can't be empty").not().isEmpty(), check('name').trim()
    .isLength({
        min: 3,
        max: 17
    }),
    check('password', "Password should contain at least 8 characters").isLength({min: 8}), phone_number_validation], authController.sign_up)

// /api/app/auth/logout
router.post('/logout', [check('refreshToken').not().isEmpty()], authController.logout)

// /api/app/auth/send-otp
router.post('/check-phone-number', [phone_number_validation], authController.check_phone_number)

// /api/app/auth/otp-send
module.exports = router
