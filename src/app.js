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
app.use(cors())
connectDB()

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/item', itemRouter)
app.use('/api/report', reportRouter)
app.use('/api/booking', bookingRouter)

app.use(express.static(path.join(__dirname, '../frontend')))
// Servire 'main' come root
app.use(express.static(path.join(__dirname, '../frontend/main')))

// rotta di fallback per tutte le altre richieste
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/errore/404.html'))
})

app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
