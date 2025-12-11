const express = require('express')
const router = express.Router()
const itemController = require('../controllers/itemControllers')

// GET api/report
router.get('/', itemController.getItem)
// POST api/report
router.post('/', itemController.createItem)
// GET api/report/:id
router.get('/:id', itemController.updateItem)
module.exports = router