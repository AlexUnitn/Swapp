const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/authMiddleware')

// GET api/users
router.get('/', auth, userController.getUser)
// PUT api/users/:id
router.put('/:id', auth, userController.updateUser)
// GET api/users/:id
router.get('/:id', auth, userController.getUserById)
// DELETE api/users/:id
router.delete('/:id', auth, userController.deleteUser)

module.exports = router