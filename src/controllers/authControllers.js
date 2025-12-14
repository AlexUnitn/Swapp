const userModel = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validate = require('../utils/validation')

// register new user
async function register(req, res){
    try {

        // validate request body
        const {firstName,lastName, username, email, phoneNumber, password} = req.body
        if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
            return res.status(400).json({message: 'All fields are required'})
        }

        // validate email format
        if(!validate.isValidEmail(email)){
            return res.status(400).json({message: 'Invalid email format'})
        }

        // validate phone number format
        if (!validate.isValidPhoneNumber(phoneNumber)){
            return res.status(400).json({message: 'Invalid phone number format'})
        }

        // validate password format
        if (!validate.isValidPassword(password)){
            return res.status(400).json({message: 'Invalid password format'})
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
            firstName:req.body.firstName,
            lastName: req.body.lastName,
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
                role:savedUser.role
            } 
        })

    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

async function login(req, res){
    try {
        const { email, username, phoneNumber, password } = req.body

        // check password not blank
        if (!password?.trim()){
            return res.status(400).json({message: 'Password is required'})
        }

        // check request body has at least one identifier
        if (!email?.trim() && !username?.trim() && !phoneNumber?.trim()) {
            return res.status(400).json({message: 'Email, username or phone number is required'})
        }

        // Build query dynamically based on provided fields
        const query = {};
        if (email?.trim()) query.email = email.trim();
        else if (username?.trim()) query.username = username.trim();
        else if (phoneNumber?.trim()) query.phoneNumber = phoneNumber.trim();

        // check the user exists
        const existingUser = await userModel.findOne(query)
        if (!existingUser) {
            return res.status(400).json({message: 'Invalid credentials'})
        }

        //validate password 
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Invalid credentials'})
        }

        // Check valid token in the header
        const authHeader = req.header('Authorization')
        if (authHeader){
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;

            try{
                // verify validity of the existing token
                jwt.verify(token, process.env.JWT_SECRET)

                // login successful with existing token
                return res.status(200).json({
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: existingUser._id,
                        username: existingUser.username,
                        email: existingUser.email,
                        role: existingUser.role
                    }
                })
            } catch (tokenError){
                // Token invalid or expired, proceed to create a new one
            }
        } 

        // create new token
        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            }
        });
    } catch (err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    register,
    login
}