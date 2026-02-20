const mongoose = require('mongoose')
const Message = require('../models/Message')
const itemModel = require('../models/Item')
const bookingModel = require('../models/Booking')

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

async function createBookingProposal(req, res) {
  try {
    const { conversationKey, recipient, itemId, requestedStartDate, requestedEndDate } = req.body
    if (!conversationKey || !recipient || !itemId || !requestedStartDate || !requestedEndDate) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const item = await itemModel.findById(itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    if (item.status !== 'available') {
      return res.status(409).json({ message: 'Item is not available' })
    }

    const start = new Date(requestedStartDate)
    const end = new Date(requestedEndDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ message: 'Invalid date range' })
    }

    const sender = req.user.id
    const ownerId = String(item.userId)
    const borrowerId = String(sender) === ownerId ? String(recipient) : String(sender)
    const startLabel = start.toISOString().slice(0, 10)
    const endLabel = end.toISOString().slice(0, 10)
    const text = `Proposta prenotazione: ${item.title} (${startLabel} - ${endLabel})`

    const doc = await Message.create({
      conversationKey,
      sender,
      recipient,
      text,
      meta: {
        type: 'booking_proposal',
        status: 'pending',
        itemId: String(item._id),
        itemTitle: item.title,
        ownerId,
        borrowerId,
        requestedStartDate: start.toISOString(),
        requestedEndDate: end.toISOString()
      }
    })

    await doc.populate('sender recipient', 'username firstName lastName')

    return res.status(201).json(doc)
  } catch (err) {
    console.error('Create booking proposal error:', err)
    return res.status(500).json({ message: err.message })
  }
}

async function respondToBookingProposal(req, res) {
  try {
    const { action } = req.body
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' })
    }

    const msg = await Message.findById(req.params.id)
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' })
    }

    if (!msg.meta || msg.meta.type !== 'booking_proposal') {
      return res.status(400).json({ message: 'Message is not a booking proposal' })
    }

    const userId = String(req.user.id)
    if (String(msg.recipient) !== userId) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const currentStatus = msg.meta.status || 'pending'
    if (currentStatus !== 'pending') {
      return res.status(409).json({ message: 'Proposal already handled' })
    }

    if (action === 'accept') {
      const item = await itemModel.findById(msg.meta.itemId)
      if (!item) {
        return res.status(404).json({ message: 'Item not found' })
      }
      if (item.status !== 'available') {
        return res.status(409).json({ message: 'Item is not available' })
      }

      const booking = await bookingModel.create({
        item: item._id,
        borrower: msg.meta.borrowerId || msg.sender,
        requestedStartDate: msg.meta.requestedStartDate,
        requestedEndDate: msg.meta.requestedEndDate,
        status: 'accepted'
      })

      await itemModel.findByIdAndUpdate(item._id, { status: 'booked' })

      msg.meta = {
        ...msg.meta,
        status: 'accepted',
        bookingId: String(booking._id),
        respondedBy: userId,
        respondedAt: new Date().toISOString()
      }
    } else {
      msg.meta = {
        ...msg.meta,
        status: 'rejected',
        respondedBy: userId,
        respondedAt: new Date().toISOString()
      }
    }

    msg.markModified('meta')
    await msg.save()

    await msg.populate('sender recipient', 'username firstName lastName')

    return res.status(200).json(msg)
  } catch (err) {
    console.error('Respond to booking proposal error:', err)
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
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Aggregate to get unique conversation keys with last message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId },
            { recipient: userObjectId }
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
                  { $eq: ['$recipient', userObjectId] },
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
  createBookingProposal,
  respondToBookingProposal,
  getConversation,
  getMyConversations
}
