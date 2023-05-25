const express = require('express')
const cors = require('cors')

const app = express()

//import Routes
const UserRoutes = require('./routes/UserRoutes')

//Config Json response
app.use(express.json())

//Solve cors
app.use(cors({
     credentials: true,
     origin:'http://localhost:3000'
}))

//Public folder for images
app.use(express.static('public'))

//dotenv
require('dotenv').config()

//Routes
app.use('/users', UserRoutes)

app.listen(5000, () => {
    console.log('Servidor rodando')
})