const {Router} = require('express')
const router = Router()
const conversationController = require('../controllers/conversation-controller')
const userMiddleware = require('../middlewares/user.middleware')
const authMiddleware = require('../middlewares/auth.middleware')

router.post(
    '/',

    [authMiddleware, userMiddleware],
    conversationController.create_conversation)
router.post(
    '/get-user-conversations',

    [authMiddleware, userMiddleware],
    conversationController.get_user_conversations)
module.exports = router
