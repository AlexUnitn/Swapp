const bookingModel = require('../models/Booking')
const itemModel = require('../models/Item')
const userModel = require('../models/User')

// get all bookings
async function getBookings (req,res){
    try{
        const bookings = await bookingModel.find()
        if (!bookings) {
            return res.status(404).json({ message: 'No bookings found' })
        }
        res.status(200).json(bookings)
    } catch (err){
        res.status(500).json({message: err.message})
    }

}
// create a booking
async function createBooking (req,res){
    try{
        const item = await itemModel.findById(req.body.item)
        if (!item) {
            return res.status(404).json({ message: 'Item not found' })
        }
        const borrower = await userModel.findById(req.body.borrower)
        if (!borrower) {
            return res.status(404).json({ message: 'Borrower not found' })
        }

        if (item.status != 'available'){
            return res.status(404).json({ message: 'Item is not available' })
        }

        const booking = await bookingModel.create(req.body)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not created' })
        }

        return res.status(201).json(booking)

    } catch (err){
        res.status(500).json({message: err.message})
    }
}

// delete a booking by Id
async function deleteBooking(req,res){
    try {
        const booking = await bookingModel.findByIdAndDelete(req.params.id)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        return res.status(200).json({ message: 'Booking deleted' })
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

// update a booking by Id
async function updateBooking(req,res){
    try {
        const booking = await bookingModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        return res.status(200).json(booking)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

// get a booking by Id
async function getBookingById(req,res){
    try {
        const booking = await bookingModel.findById(req.params.id)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' })
        }
        return res.status(200).json(booking)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}



module.exports = {
    getBookings,
    createBooking, 
    deleteBooking,
    updateBooking
}