const mongoose = require('mongoose')

const uri = "mongodb+srv://gcgabriel257:bielcarlos2503@cluster0.dtnkjb1.mongodb.net/?retryWrites=true&w=majority";

async function main(){
    
    await mongoose.connect(uri)
    console.log("Conectou ao Banco!")
    
}

main().catch((err) => console.log(err))

module.exports = mongoose

