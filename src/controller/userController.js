const userModel = require('../models/userModel')

// get all user
async function getUser(req,res){
    try{
        const users = await userModel.find()
        return res.status(200).json(users)
    } catch (err){
        return res.status(500).json({message: err.message})
    }

}
