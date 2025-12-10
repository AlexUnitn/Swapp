//Caricamento variabili d'ambiente 
require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/userRoutes')
const connectDB = require('./db')


const app = express()

connectDB()
app.use('/api/users', userRouter)

app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
