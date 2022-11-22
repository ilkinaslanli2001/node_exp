const {Router} = require('express')
const router = Router()
const jwtController = require('../controllers/jwt-controller')

// /api/jwt/refresh
router.post('/refresh',jwtController.refresh)


module.exports = router
