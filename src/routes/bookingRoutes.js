const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingControllers')

// GET api/booking
router.get('/', bookingController.getBookings)
// POST api/booking
router.post('/', bookingController.createBooking)
// DELETE api/booking
router.delete('/:id', bookingController.deleteBooking)
// PUT api/booking/:id
router.put('/:id', bookingController.updateBooking)
// GET api/booking/:id
router.get('/:id', bookingController.getBookingById)

module.exports = router