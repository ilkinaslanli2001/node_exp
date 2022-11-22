const {Router} = require('express')
const router = Router()
const faqController = require('../controllers/faq-controller')
const authMiddleware = require('../middlewares/auth.middleware')
const userMiddleware = require('../middlewares/user.middleware')
const adminMiddleware = require('../middlewares/admin.middleware')

router.get('/:type', faqController.get_faqs)
router.post('', [authMiddleware, userMiddleware, adminMiddleware], faqController.add_faq)
module.exports = router
