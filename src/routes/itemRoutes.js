const express = require('express')
const router = express.Router()
const itemController = require('../controllers/itemControllers')

// GET api/item
router.get('/', itemController.getItem)
// POST api/item
router.post('/', itemController.createItem)
// PUT api/item/:id
router.put('/:id', itemController.updateItem)
// GET api/item/:id
router.get('/:id', itemController.getItemById)
// DELETE api/item/:id
router.delete('/:id', itemController.deleteItem)
// GET api/item/user/:userId
router.get('/user/:userId', itemController.getItemsByUserId)
// GET api/item/recipient/:userId
router.get('/recipient/:userId', itemController.getItemsByRecipientId)

module.exports = router