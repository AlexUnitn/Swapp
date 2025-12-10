const userModel = require('../models/user')

// get all user
async function getUser(req,res){
    try{
        const users = await userModel.find()
        return res.status(200).json(users)
    } catch (err){
        return res.status(500).json({message: err.message})
    }

}
// create a user
async function createUser(req,res){
    try{
        const user = await userModel.create(req.body)
        return res.status(201).json(user)
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    getUser,
    createUser
}