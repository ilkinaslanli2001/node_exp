const {Router} = require('express')
const router = Router()
const userController = require('../controllers/user-controller')
const commonController = require('../controllers/common-controller')
const notificationController = require('../controllers/notification-controller')
const authMiddleware = require('../middlewares/auth.middleware')
const isUserBlocked = require('../middlewares/is-user-blocked.middleware')
const userMiddleware = require('../middlewares/user.middleware')
const multer = require('multer');
const {body} = require("express-validator");
const {check} = require("express-validator");
const ApiError = require("../exceptions");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },

    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/[\/\\:]/g, "_") + "$" + req.body.id + "$" + path.extname(file.originalname)
        )
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png']
        let ext = path.extname(file.originalname)
        if (!allowedExtensions.includes(ext)) {
            return cb(ApiError.BadRequest('File is not allowed'))
        }
        cb(null, true)
    }
})


// /api/app/user/me
router.get('/me', userController.me)

// /api/app/user/get-cars
router.get('/cars', commonController.get_cars)
router.get('/get-decline-cases/:type', commonController.get_decline_cases)
router.get('/policy', commonController.get_policy)
router.post('/get-rides-driver', [authMiddleware, userMiddleware], userController.get_rides_driver)

router.post('/get-passenger-rides/', [authMiddleware, userMiddleware], userController.get_passenger_rides)
router.put('/passenger-decline-ride/', [authMiddleware, userMiddleware, check('ride_id').not().isEmpty(), check('number_of_declined_places').isNumeric().isInt({
    min: 1,
    max: 1000
})], userController.passenger_decline_ride),
    router.put('/driver-decline-ride/', [authMiddleware, userMiddleware, check('ride_id').not().isEmpty(),], userController.driver_decline_ride),
    router.put('/change-user-settings/', [
        authMiddleware, userMiddleware, isUserBlocked,
        check('name')
            .if(body('name')
                .exists({checkNull: true}))
            .trim()
            .isLength({
                min: 3,
                max: 1024
            })
            .matches(/^[a-zA-ZüÜöÖğĞıIəƏçÇşŞİi]+$/),

        check('password')
            .if(body('password')
                .exists({checkNull: true}))
            .trim()
            .isLength({
                min: 8,
                max: 1024
            }).isString()], userController.change_user_settings)
router.put('/change-user-profile-picture/', [upload.single('profile_picture'), authMiddleware, userMiddleware, isUserBlocked], userController.change_user_profile_picture)
router.post('/user-balance/', [authMiddleware, userMiddleware], userController.user_balance)
router.post('/get-user-notifications/', [authMiddleware, userMiddleware], notificationController.get_user_notifications)
router.put('/make-notifications-read/', [authMiddleware, userMiddleware], notificationController.make_notifications_read)
router.post('/request-for-verification/', [upload.array('images', 2), authMiddleware, userMiddleware, isUserBlocked], userController.request_for_verifications)
router.get('/contact-us/', commonController.contact_us)
router.put('/delete_rate_from_queue/', [authMiddleware, userMiddleware, check('driver_id').not().isEmpty()], userController.delete_rate_from_queue)
router.put('/change_user_rating/', [authMiddleware, userMiddleware, check('rating').isNumeric().isFloat({
    min: 1,
    max: 5
}), check('driver_id').not().isEmpty()], userController.change_user_rating)
module.exports = router
