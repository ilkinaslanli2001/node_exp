const isUserBlocked = require('../middlewares/is-user-blocked.middleware')
const {Router} = require('express')
const router = Router()
const rideController = require('../controllers/ride-controller')
const commonService = require('../services/common-services')
const commonController = require('../controllers/common-controller')
const authMiddleware = require('../middlewares/auth.middleware')
const userMiddleware = require('../middlewares/user.middleware')
const {check} = require("express-validator");
const _ = require('lodash');
router.post('/add-ride', [authMiddleware, userMiddleware, isUserBlocked,
    check('number_of_seats').isNumeric().isInt({min: 1, max: 20}),
    check('features').not().isEmpty().custom(async (val) => {
        const features = await commonService.get_data('features_of_ride')

        if (_.isEqual(_.sortBy(Object.keys(features.data)), _.sortBy(Object.keys(val)))) {
            for (const [key, value] of Object.entries(val)) {
                if (typeof value !== "boolean") return Promise.reject();
            }
            return true
        } else return Promise.reject();
    }),

    /* check('description').if(body('description').exists({checkNull: true})).trim().isLength({
    min: 3,
    max: 1024
}).withMessage('Description is invalid'),*/
    check('price_for_seat').isNumeric().isInt({min: 1, max: 100}),
], rideController.add_ride)
router.put('/start-ride/', [authMiddleware, userMiddleware, check('ride_id').not().isEmpty()], rideController.start_ride)
router.put('/finish-ride/', [authMiddleware, userMiddleware, check('ride_id').not().isEmpty()], rideController.finish_ride)
router.get('/cities', commonController.get_cities)
router.get('/features', commonController.get_features_of_ride)
router.post('/delete-passenger-from-ride/', [authMiddleware, userMiddleware, check('ride_id').not().isEmpty()], rideController.delete_passenger_from_ride)
router.post('/search-rides', [authMiddleware, userMiddleware], rideController.search_rides)
router.post('/get-ride-info/:rideId', [authMiddleware, userMiddleware,], rideController.get_ride_info)
router.put('/set-ride-active-state/', [authMiddleware, userMiddleware, check('state').isBoolean()], rideController.set_ride_active_state)
router.post('/add-passenger-to-ride/', [authMiddleware, userMiddleware, isUserBlocked, check('ride_id').not().isEmpty(), check('number_of_seats').isNumeric().isInt({
    min: 1,
    max: 1000
})], rideController.add_passenger_to_ride)
module.exports = router
