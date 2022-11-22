const moment = require('moment')
const {Router} = require('express')
const router = Router()
const firebaseController = require('../controllers/fireabse-controller')
const authMiddleware = require('../middlewares/auth.middleware')
const userMiddleware = require('../middlewares/user.middleware')

router.post('/add-fcm-token', [authMiddleware, userMiddleware], firebaseController.add_fcm_token)

module.exports = router
