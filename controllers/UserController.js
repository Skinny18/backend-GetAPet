const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

//helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {

    static async register(req, res){

        const {name, email, phone, password, confirmpassword} = req.body

        //validations
        if(!name){
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        if(!email){
            res.status(422).json({message: 'O E-mail é obrigatório'})
            return
        }
        if(!phone){
            res.status(422).json({message: 'O Telefone é obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({message: 'A senha é obrigatória'})
            return
        }
        if(!confirmpassword){
            res.status(422).json({message: 'A confirmação de senha é obrigatória'})
            return
        }

        if(confirmpassword != password){
            res.status(422).json({message: "As senhas precisam ser iguais!"})
            return
        }

        //check if user exists
        const userExists = await User.findOne({email: email})
        if(userExists){
            res.status(422).json({message: 'Por favor, utilize outro e-mail!'})
            return
        }

        //create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        //create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        try{
            const newUser = await user.save()
            
            await createUserToken(newUser, req, res)

        }catch(err){
            res.status(500).json({message: err})    
        }
    }

    static async login(req, res){

        const {email, password} = req.body

        if(!email){
            res.status(422).json({message: 'O E-mail é obrigatório'})
            return
        }
        if(!password){
            res.status(422).json({message: 'A senha é obrigatório'})
            return
        }

        //check if user exists
        const user = await User.findOne({email: email})
        if(!user){
            res.status(422).json({message: 'Não há usuário cadastrado com este e-mail!'})
            return
        }

        //check if password match with db password
        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({message: 'Senha Inválida!'})
            return
        }

        await createUserToken(user, req, res)

    }

    static async checkUser(req, res){

        let currentUser

        if(req.headers.authorization){
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)

            currentUser.password = undefined

        }else{
            currentUser = null
        }

        res.status(200).send(currentUser)

    }
    
    static async getUserById(req, res){

        const id = req.params.id

        const user = await User.findById(id).select("-password")

        if(!user){
            res.status(422).json({
                message: "Usuário não encontrado!"
            })

            return
        }

        res.status(200).json({user})
    }

    static async editUser(req, res){
        const id = req.params.id

        //check if users exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword

        
        if(req.file){
            user.image = req.file.filename
        }


        //validations
        if(!name){
            res.status(422).json({message: 'O nome é obrigatório'})
            return
        }
        if(!email){
            res.status(422).json({message: 'O E-mail é obrigatório'})
            return
        }
        //check if email already taken
        const userExists = await User.findOne({email: email})

        if(user && user.email !== email && userExists){
            res.status(422).json({
                message: 'Por favor, utilize outro e-mail!'
            })
            return
        }

        user.email = email

        if(!phone){
            res.status(422).json({message: 'O Telefone é obrigatório'})
            return
        }

        user.phone = phone

        if(password != confirmpassword){
            res.status(422).json({message: "As senhas não conferem!"})
            return
        }else if(password === confirmpassword && password != null){
            //creating password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
    
        }
        
        try{
            //returns user update data
             await User.findOneAndUpdate(
                {_id: user._id},
                {$set: user},
                {new: true},
            )

            res.status(200).json({message: "Usuário Atualizado com sucesso!"})

        }catch(err){
            res.status(500).json({message: err})
            return
        }


    }

}