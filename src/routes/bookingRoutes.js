const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingControllers')
const auth = require('../middleware/authMiddleware')

// GET api/booking
router.get('/', auth, bookingController.getBookings)
// POST api/booking
router.post('/', auth, bookingController.createBooking)
// DELETE api/booking
router.delete('/:id', auth, bookingController.deleteBooking)
// PUT api/booking/:id
router.put('/:id', auth, bookingController.updateBooking)
// GET api/booking/:id
router.get('/:id', auth, bookingController.getBookingById)
// GET api/booking/user/:id
router.get('/user/:id', auth, bookingController.getBookingsByUserId)

module.exports = router