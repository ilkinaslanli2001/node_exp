const {Router} = require("express")
const authController = require("../controllers/auth-controller")
const adminController = require("../controllers/admin-controller")
const jwtController = require("../controllers/jwt-controller")
const router = Router()
const {check, body} = require("express-validator")
const authMiddleware = require("../middlewares/auth.middleware")
const adminMiddleware = require("../middlewares/admin.middleware")
const userMiddleware = require("../middlewares/user.middleware")
const adminAuthController = require("../middlewares/admin-auth.middleware")
const checkJsonMiddleware = require("../middlewares/check-json.middleware")
const commonService = require('../services/common-services')
const ApiError = require("../exceptions");
const {ACCEPT, REJECT} = require("../constants/constant")
const {

    checkRideTime

} = require('../helpers/ride-helper')
// /api/admin/sign_in
router.post(
    "/sign-in",
    [
        check("phone_number", "Phone number can't be empty").not().isEmpty(),
        check("password", "Password can't be empty").not().isEmpty(),
    ],
    authController.sign_in_admin
)
router.post(
    "/refresh",
    jwtController.admin_refresh
)


router.post(
    "/features-of-ride",
    [adminAuthController, userMiddleware, adminMiddleware, checkJsonMiddleware],
    adminController.add_features_of_ride
)
router.put(
    "/common-data",
    [
        adminAuthController,
        userMiddleware,
        adminMiddleware,
        checkJsonMiddleware,
        check("key").not().isEmpty(),
    ],
    adminController.change_common_data
)
router.post(
    "/search-user",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.search_users
)
router.get(
    "/get-other-data",
    adminController.get_other_data
)
router.post(
    "/get-ride-info/:rideId",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.get_ride_info
)
router.post("/logout", authController.logout_admin)
router.post(
    "/get-requests-for-verification",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.get_requests_for_verification
)
router.post(
    "/get-or-edit-user-info",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.get_or_edit_user_info
)
router.post(
    "/get-rides",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.get_rides
)
router.post(
    "/get-transactions",
    [adminAuthController, userMiddleware, adminMiddleware],
    adminController.get_transactions
)
router.post(
    "/send-notification",
    [
        adminAuthController, userMiddleware, adminMiddleware,
        check("title").not().isEmpty(),
        check("body").not().isEmpty(),
    ],
    adminController.send_notification
)

router.post(
    "/response-to-request",
    [
        adminAuthController, userMiddleware, adminMiddleware,
        check("request_id").not().isEmpty(),
        check("type")
            .not()
            .isEmpty()
            .custom((val) => {
                return val !== ACCEPT || val !== REJECT
            }),
    ],
    adminController.response_to_request
)
router.put('/edit-ride-info/:ride_id', [adminAuthController, userMiddleware, adminMiddleware, body('edited_ride').custom(async (edited_ride) => {
    if (edited_ride.price_for_seat) {
        const price = edited_ride.price_for_seat
        if (!Number.isInteger(price)) {
            return Promise.reject();
        }
        if (price > 100 || price < 1)
            return Promise.reject();
    }
    if (edited_ride.ride_state) {
        const state = edited_ride.ride_state
        if (!Number.isInteger(state))
            return Promise.reject();
        if (state > 4 || state < 1)
            return Promise.reject();
    }
    if (edited_ride.features_of_ride) {
        const features = await commonService.get_data('features_of_ride')
        const edited_features = edited_ride.features_of_ride
        for (const [key, value] of Object.entries(edited_features)) {
            if (typeof value !== "boolean" || Object.keys(features).includes(key)) return Promise.reject();
        }
    }
    //ToDo check times
    return true
}),], adminController.edit_ride_info)

module.exports = router
