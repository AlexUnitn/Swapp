const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportControllers')
const auth = require('../middleware/authMiddleware')

// GET api/report
router.get('/', auth, reportController.getReport)
// POST api/report
router.post('/', auth, reportController.createReport)
// GET api/report/:id
router.get('/:id', auth, reportController.getReportById)
module.exports = router