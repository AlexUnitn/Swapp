const Message = require('../models/Message')

// create a message
async function createMessage(req, res){
  try{
    const { conversation, message } = req.body
    if (!conversation || !message || !message.text) {
      return res.status(400).json({ message: 'Invalid payload' })
    }

    const doc = await Message.create({
      conversationKey: conversation,
      sender: message.senderId || null,
      senderName: message.senderName || message.sender || null,
      text: message.text,
      meta: message.meta || {}
    })

    return res.status(201).json(doc)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// get messages for a conversation
async function getConversation(req, res){
  try{
    const key = req.params.key
    const msgs = await Message.find({ conversationKey: key }).sort({ createdAt: 1 })
    return res.status(200).json(msgs)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createMessage,
  getConversation
}
