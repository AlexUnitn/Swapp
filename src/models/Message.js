const mongoose = require('mongoose')
const { Schema } = mongoose

const MessageSchema = new Schema({
  conversationKey: { type: String, required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  text: { type: String, required: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true })

const Message = mongoose.model('Message', MessageSchema)
module.exports = Message
