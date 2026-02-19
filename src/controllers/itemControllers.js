const itemModel = require('../models/Item')

// get item with optional search and category filters
async function getItem(req, res){
    try{
        const {search, category} = req.query

        let query = {}

        // if the user filter by category 
        if(category){
            query.category = { $regex: new RegExp(`^${category}$`, 'i') }
        }

        let items;
        if (search) {
            query.$text = { $search: search };
            items = await itemModel.find(query, { score: { $meta: "textScore" } })
                                   .sort({ score: { $meta: "textScore" } });
        } else {
            items = await itemModel.find(query).sort({ createdAt: -1 });
        }
        res.status(200).json(items)
    } catch(err){
        res.status(500).json({message: err.message})
    }
}

// get a item by itemID
async function getItemById(req, res){
    try {
        const item = await itemModel.findById(req.params.id)
        if (!item){
            return res.status(404).json({message: 'Item not found'})
        }

        return res.status(200).json(item)
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

// create a item
async function createItem(req,res){
    try{
        // TODO: hashare la password
        const item = await itemModel.create(req.body)
        if (!item) {
            return res.status(400).json({message: 'Item not created'})
        }
        return res.status(201).json({message: 'Item created'})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

//modify a item by ID 
async function updateItem(req,res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const item = await itemModel.findByIdAndUpdate(req.params.id, req.body)
        if (!item) {
            return res.status(404).json({message: 'Item not found'})
        }
        return res.status(200).json({message: 'Item updated'})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

// delete a item by ID
async function deleteItem(req,res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const item = await itemModel.findByIdAndDelete(req.params.id)
        if (!item){
            return res.status(404).json({message: 'Item not found'})
        }
        return res.status(200).json({message: "Item deleted"})

    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

// get all items by userID
async function getItemsByUserId(req, res){
    try{
        const items = await itemModel.find({userId: req.params.userId})
        if (!items) {
            return res.status(404).json({message: 'Items not found'})
        }

        return res.status(200).json(items)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

async function getItemsByRecipientId(req, res){
    try{
        const items = await itemModel.find({recipientId: req.params.recipientId})
        if (!items) {
            return res.status(404).json({message: 'Items not found'})
        }

        return res.status(200).json(items)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    getItem,
    createItem,
    updateItem,
    getItemById,
    deleteItem,
    getItemsByUserId,
	getItemsByRecipientId
}