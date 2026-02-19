const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageControllers')
const auth = require('../middleware/authMiddleware')

// GET /api/messages/conversation/:key
router.get('/conversation/:key', auth, messageController.getConversation)

// POST /api/messages
router.post('/', auth, messageController.createMessage)

module.exports = router
