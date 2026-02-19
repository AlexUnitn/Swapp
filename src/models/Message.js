const mongoose = require('mongoose')
const { Schema } = mongoose

const MessageSchema = new Schema({
  conversationKey: { type: String, required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true })

MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })

const Message = mongoose.model('Message', MessageSchema)
module.exports = Message