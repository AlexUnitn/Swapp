//Caricamento variabili d'ambiente 
require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/userRoutes')
const connectDB = require('./db')

app.use('/api/users', userRouter)

const app = express()
connectDB()
app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
