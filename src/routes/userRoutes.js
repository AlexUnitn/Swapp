const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// GET api/user 
router.get('/', userController.getUser)
// POST api/user
router.post('/', userController.createUser)
// PUT api/user/:id
router.put('/:id', userController.updateUser)

module.exports = router