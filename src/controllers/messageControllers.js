const Message = require('../models/Message')

// Create a message
async function createMessage(req, res) {
  try {
    const { conversationKey, recipient, text, meta } = req.body
    
    // Validation
    if (!conversationKey || !recipient || !text) {
      return res.status(400).json({ 
        message: 'Missing required fields: conversationKey, recipient, text' 
      })
    }

    // sender comes from authenticated user (JWT)
    const sender = req.user.id

    const doc = await Message.create({
      conversationKey,
      sender,
      recipient,
      text,
      meta: meta || {}
    })

    // Populate sender and recipient for the response
    await doc.populate('sender recipient', 'username firstName lastName')

    return res.status(201).json(doc)
  } catch (err) {
    console.error('Create message error:', err)
    return res.status(500).json({ message: err.message })
  }
}

// Get messages for a conversation
async function getConversation(req, res) {
  try {
    const { conversationKey } = req.query
    
    if (!conversationKey) {
      return res.status(400).json({ message: 'conversationKey query parameter required' })
    }

    const userId = req.user.id

    // Security: only return messages where current user is sender OR recipient
    const msgs = await Message.find({
      conversationKey,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate('sender recipient', 'username firstName lastName')
    .sort({ createdAt: 1 })

    return res.status(200).json(msgs)
  } catch (err) {
    console.error('Get conversation error:', err)
    return res.status(500).json({ message: err.message })
  }
}

// Get all conversations for current user (useful for sidebar)
async function getMyConversations(req, res) {
  try {
    const userId = req.user.id

    // Aggregate to get unique conversation keys with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { recipient: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationKey',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ])

    return res.status(200).json(conversations)
  } catch (err) {
    console.error('Get my conversations error:', err)
    return res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createMessage,
  getConversation,
  getMyConversations
}