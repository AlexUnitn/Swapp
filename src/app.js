require('dotenv').config()
const express = require('express')
const itemRouter = require('./routes/itemRoutes')
const connectDB = require('./db')


const app = express()

app.use(express.json())

connectDB()
app.use('/api/item ', itemRouter)

app.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000')
})
