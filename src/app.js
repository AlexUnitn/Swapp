//Caricamento variabili d'ambiente 
require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors') 
const userRouter = require('./routes/userRoutes')
const itemRouter = require('./routes/itemRoutes')
const reportRouter = require('./routes/reportRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const authRouter = require('./routes/authRoutes')

const connectDB = require('./db')


const app = express()
app.use(express.json())
app.use(cors()) // Abilita CORS

connectDB()

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/item', itemRouter)
app.use('/api/report', reportRouter)
app.use('/api/booking', bookingRouter)

// Servire i file statici del Frontend
app.use(express.static(path.join(__dirname, '../frontend/main')))

// Rotta di fallback: per qualsiasi altra richiesta, restituisci la homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/main/index.html'))
})

app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
