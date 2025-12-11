const userModel = require('../models/user')

// get all user
async function getUser(req, res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const users = await userModel.find()
        if (!users) {
            return res.status(404).json({message: 'Users not found'})
        }

        // elimina la password dal risultato
        const findUsers = users.map(user => user.toObject());
        findUsers.forEach(user => delete user.password);

        return res.status(200).json(findUsers)
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
        
        // elimina la password dal risultato
        const findUser = user.toObject();
        delete findUser.password;

        return res.status(200).json(findUser)
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}

// create a user
async function createUser(req,res){
    try{
        // TODO: hashare la password
        const user = await userModel.create(req.body)
        if (!user) {
            return res.status(400).json({message: 'User not created'})
        }
        
        return res.status(201).json({message: 'User created'})
    } catch (err){
        // controlla quale campo è duplicato e lo segnala
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field} is already registered`
            });
        }
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
        return res.status(200).json({message: 'User updated'})
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

// delete a user by ID
async function deleteUser(req,res){
    try{
        //TODO: aggiungere middleware per l'autenticazione
        const user = await userModel.findByIdAndDelete(req.params.id)
        if (!user){
            return res.status(404).json({message: 'User not found'})
        }
        return res.status(200).json({message: "User deleted"})

    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    getUserById,
    deleteUser
}