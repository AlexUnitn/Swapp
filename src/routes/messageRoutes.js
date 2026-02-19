const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageControllers')

// GET /api/messages/conversation/:key
router.get('/conversation/:key', messageController.getConversation)

// POST /api/messages
router.post('/', messageController.createMessage)

module.exports = router
