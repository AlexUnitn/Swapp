const userModel = require('../models/user')



// get all user
async function getUser(req, res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const users = await userModel.find()
        if (!users) {
            return res.status(404).json({message: 'Users not found'})
        }
        return res.status(200).json(users)
    } catch (err){
        return res.status(500).json({message: err.message})
    }

}

// get a user by ID
async function getUserById(req, res){
    try {
        //TODO: aggiungere middleware per l'autenticazione
        const user = await userModel.findById(req.params.id)
        if (!user){
            return res.status(404).json({message: 'User not found'})
        }
        return res.status(200).json(user)
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

// create a user
async function createUser(req,res){
    try{
        const user = await userModel.create(req.body)
        if (!user) {
            return res.status(400).json({message: 'User not created'})
        }
        return res.status(201).json(user)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

//modify a user by ID 
async function updateUser(req,res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const user = await userModel.findByIdAndUpdate(req.params.id, req.body)
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }
        return res.status(200).json(user)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}


module.exports = {
    getUser,
    createUser,
    updateUser,
    getUserById
}