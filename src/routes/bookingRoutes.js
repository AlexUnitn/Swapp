const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingControllers')

// GET api/booking
router.get('/', bookingController.getAllBookings)
// POST api/booking
router.post('/', bookingController.createBooking)


module.exports = router