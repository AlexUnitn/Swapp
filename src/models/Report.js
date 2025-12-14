const mongoose = require('mongoose')
const {Schema} = mongoose 

const reportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reportedObject: { type: Schema.Types.ObjectId, ref: 'Object' },
  type: {
    type: String,
    required: true,
    enum: [
      'inappropriate_behavior', 'object_mismatch', 'unreturned_item',
      'inappropriate_content', 'technical_issue', 'other'
    ]
  },
  
  description: { type: String, required: true, maxlength: 1000 },
  
  evidence: [{
    type: { type: String, enum: ['image', 'screenshot'] },
    url: String
  }],
  
  status: { 
    type: String, 
    enum: ['new', 'in_review', 'resolved', 'dismissed'], 
    default: 'new' 
  },
  
  adminNotes: String,
  actionTaken: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date

}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report
