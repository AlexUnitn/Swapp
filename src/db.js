const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URL)
        console.log('Connessione al database avvenuta con successo')
    } catch (err){
        console.error('Errore durante la connessione al database:', err.message)
        process.exit(1)
    }

}

module.exports = connectDB