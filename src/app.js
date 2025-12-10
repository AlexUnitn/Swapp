//Caricamento variabili d'ambiente 
require('dotenv').config()

const express = require('express')
const connectDB = require('./db')

const app = express()
connectDB()