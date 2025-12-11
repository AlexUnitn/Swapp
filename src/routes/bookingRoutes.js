const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingControllers')

// GET api/booking
router.get('/', bookingController.getBookings)
// POST api/booking
router.post('/', bookingController.createBooking)


module.exports = router