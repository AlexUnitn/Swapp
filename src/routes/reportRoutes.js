const express = require('express')
const router = express.Router()
const itemController = require('../controllers/reportControllers')

// GET api/report
router.get('/', itemController.getReport)
// POST api/report
router.post('/', itemController.createReport)
// GET api/report/:id
router.get('/:id', itemController.getReportById)
module.exports = router