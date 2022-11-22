const {Router} = require('express')
const router = Router()
const paymentController = require('../controllers/payment-controller')

router.get('/million', paymentController.million_payment)
router.post('/success',)
router.post('/error',)
router.post('/result',)


module.exports = router
