const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// GET api/users
router.get('/', userController.getUser)
// POST api/users
router.post('/', userController.createUser)
// PUT api/users/:id
router.put('/:id', userController.updateUser)
// GET api/users/:id
router.get('/:id', userController.getUserById)
// DELETE api/users/:id
router.delete('/:id', userController.deleteUser)

module.exports = router