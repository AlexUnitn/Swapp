const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportControllers')

// GET api/report
router.get('/', reportController.getReport)
// POST api/report
router.post('/', reportController.createReport)
// GET api/report/:id
router.get('/:id', reportController.getReportById)
module.exports = router