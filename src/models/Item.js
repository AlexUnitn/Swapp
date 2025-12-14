const mongoose = require('mongoose')
const {Schema} = mongoose 

const ItemSchema = new Schema({
  title: { type: String, required: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, minlength: 5, maxlength: 2000 },
  
  // Riferimento all'utente (Relazione)
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  category: { type: String, required: true },
  
  images: [{
    data: String, // base64
    isMain: { type: Boolean, default: false }
  }],
  
  maxLoanDuration: { type: Number, min: 1 }, // in giorni
  
  status: { 
    type: String, 
    enum: ['available', 'booked', 'on_loan', 'unavailable', 'deleted'], 
    default: 'available' 
  },
  
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true }
  },
  
  unavailablePeriods: [{
    startDate: { type: Date},
    endDate: { type: Date }
  }]

}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item
