const express = require('express')
const userRouter = require('./routes/userRoutes')

const app = express()

app.use('/api/users', userRouter)