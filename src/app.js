//Caricamento variabili d'ambiente 
require('dotenv').config()
const express = require('express')
const userRouter = require('./routes/userRoutes')
const itemRouter = require('./routes/itemRoutes')
const reportRouter = require('./routes/reportRoutes')
const bookingRouter = require('./routes/bookingRoutes')

const connectDB = require('./db')


const app = express()
app.use(express.json())

connectDB()
app.use('/api/users', userRouter)
app.use('/api/item', itemRouter)
app.use('/api/report', reportRouter)
app.use('/api/booking', bookingRouter)

app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
