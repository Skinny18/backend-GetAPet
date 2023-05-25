const mongoose = require('mongoose')
require('dotenv').config()
const PASS = process.env.B_PASS
const USER = process.env.B_USER
const uri = `mongodb+srv://${USER}:${PASS}@cluster0.dtnkjb1.mongodb.net/?retryWrites=true&w=majority`;

async function main(){
    
    await mongoose.connect(uri)
    console.log("Conectou ao Banco!")
    
}

main().catch((err) => console.log(err))

module.exports = mongoose

