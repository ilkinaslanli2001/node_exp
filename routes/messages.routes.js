const {Router} = require('express')
const messageController = require('../controllers/message-controller')
const authMiddleware = require('../middlewares/auth.middleware')
const userMiddleware = require('../middlewares/user.middleware')
const router = Router()
router.post('/', [authMiddleware, userMiddleware,
], messageController.create_message)
router.post('/get-messages-of-conversation', [authMiddleware, userMiddleware,
], messageController.get_conversation_messages)
router.post('/mark-messages-as-read', [authMiddleware, userMiddleware,
], messageController.mark_messages_as_read)

module.exports = router
