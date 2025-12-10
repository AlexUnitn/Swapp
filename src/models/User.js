const mongoose = require('mongoose')

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username:{type:String, required: true, unique:true},
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  phoneNumber: { type: String, required: true, unique: true },
  
  
  address: {
    street: String,
    city: String,
    postalCode: String,
  },

  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'banned'], 
    default: 'active' 
  },
  
  suspensionEndDate: Date,
  // Array di oggetti
  penalties: [{
    type: { type: String }, 
    reason: String,
    appliedAt: Date,
    expiresAt: Date
  }],
  
  statistics: {
    objectsPublished: { type: Number, default: 0 },
    objectsBorrowed: { type: Number, default: 0 },
    objectsLent: { type: Number, default: 0 },
    completedTransactions: { type: Number, default: 0 }
  },
  
  lastLoginAt: Date

}, { timestamps: true }) 

const User = mongoose.model('User', userSchema)