const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageControllers')
const auth = require('../middleware/authMiddleware')

// GET /api/messages?conversationKey=xxx
router.get('/', auth, messageController.getConversation)

// GET /api/messages/conversations (list all my conversations)
router.get('/conversations', auth, messageController.getMyConversations)

// POST /api/messages/proposal
router.post('/proposal', auth, messageController.createBookingProposal)

// POST /api/messages/proposal/:id/respond
router.post('/proposal/:id/respond', auth, messageController.respondToBookingProposal)

// POST /api/messages
router.post('/', auth, messageController.createMessage)

module.exports = router
