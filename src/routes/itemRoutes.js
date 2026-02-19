const express = require('express')
const router = express.Router()
const itemController = require('../controllers/itemControllers')
const auth = require('../middleware/authMiddleware')

// GET api/item
router.get('/', itemController.getItem)
// POST api/item
router.post('/', auth, itemController.createItem)
// PUT api/item/:id
router.put('/:id', auth, itemController.updateItem)
// GET api/item/:id
router.get('/:id', itemController.getItemById)
// DELETE api/item/:id
router.delete('/:id', auth, itemController.deleteItem)
// GET api/item/user/:userId
router.get('/user/:userId', itemController.getItemsByUserId)

module.exports = router