const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// GET api/user 
router.get('/', userController.getUser)
// POST api/user
router.post('/', userController.createUser)

module.exports = router