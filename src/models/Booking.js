const mongoose = require('mongoose')
const {Schema} = mongoose 

const bookingSchema = new Schema({
    item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    lender: { type: Schema.Types.ObjectId, ref: 'User', required: true },   // Prestatore
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Chi prende in prestito
  
    requestedStartDate: { type: Date, required: true },
    requestedEndDate: { type: Date, required: true },
  
    confirmedStartDate: Date,
    confirmedEndDate: Date,
    actualPickupDate: Date,
    actualReturnDate: Date,
  
  
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'overdue', 'cancelled'],
        default: 'pending'
    },
  
    extensionRequests: [{
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        newEndDate: Date,
        requestedAt: Date,
        status: { type: String, enum: ['pending', 'approved', 'rejected'] },
        respondedAt: Date
    }]

}, { timestamps: true})

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking