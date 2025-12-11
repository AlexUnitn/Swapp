const bookingModel = require('../models/Booking')
const itemModel = require('../models/Item')
const userModel = require('../models/User')

// get all bookings
async function getAllBookings (req,res){
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
        const lender = await userModel.findById(req.body.lender)
        if (!lender) {
            return res.status(404).json({ message: 'Lender not found' })
        }
        const borrower = await userModel.findById(req.body.borrower)
        if (!borrower) {
            return res.status(404).json({ message: 'Borrower not found' })
        }

        if (lender == borrower){
            return res.status(404).json({ message: 'Lender and borrower cannot be the same person' })
        }

        if (item.status != 'available'){
            return res.status(404).json({ message: 'Item is not available' })
        }

        const booking = await bookingModel.create(req.body)
        if (!booking) {
            return res.status(404).json({ message: 'Booking not created' })
        }

    } catch (err){
        res.status(500).json({message: err.message})
    }
}

module.exports = {
    getAllBookings,
    createBooking
}