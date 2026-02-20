const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')  // Fixed typo: messageControllers -> messageController
const auth = require('../middleware/authMiddleware')

// GET /api/messages?conversationKey=xxx
router.get('/', auth, messageController.getConversation)

// GET /api/messages/conversations (list all my conversations)
router.get('/conversations', auth, messageController.getMyConversations)

// POST /api/messages
router.post('/', auth, messageController.createMessage)

module.exports = router