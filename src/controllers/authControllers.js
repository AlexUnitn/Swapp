const userModel = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// register new user
async function register(req, res){
    try {

        // validate request body
        const {firstName,lastName, username, email, phoneNumber, password} = req.body
        if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
            return res.status(400).json({message: 'All fields are required'})
        }


        // check if user already exists
        const existingUser = await userModel.findOne({$or: [{email: req.body.email}, {username: req.body.username}, {phoneNumber: req.body.phoneNumber}]})
        if (existingUser) {
            return res.status(400).json({message: 'Email, username or phone number already registered'})
        }

        //hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        
        //create user 
        const newUser = new userModel({
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword
        })
        // save the new user
        const savedUser = await newUser.save()

        // create token
        const token = jwt.sign(
            {id: savedUser._id, role:savedUser.role},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )

        return res.status(201).json({
            message: 'User registered successfully', 
            token,
            user: {
                id: savedUser._id,
                username:savedUser.username,
                email:savedUser.email,
                role:saveduser.role
            } 
        })

    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    register
}