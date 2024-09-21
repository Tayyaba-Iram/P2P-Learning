import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcrypt'
import  jwt  from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import UserModel from './models/UserModel.js'


const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/Blog-App');

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json("The token is missing")
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) {
                return res.json("The token is wrong")
            } else {
                req.email = decoded.email;
                req.username = decoded.username;
                next()
            }
        })
    }
}

app.get('/',verifyUser, (req, res) => {
    return res.json({email: req.email, username: req.username})
})



app.post('/login', (req, res) => {
    const {email, password} = req.body;
    if ( !email || !password) {
        return res.status(400).json(" email, and password are required");
  }
    UserModel.findOne({email: email})
    .then(user => {
        if(user) {
            bcrypt.compare(password, user.password, (err, response) => {
                if(response) {
                    const token = jwt.sign({email: user.email, username: user.username},
                        "jwt-secret-key", {expiresIn: '1d'})
                    res.cookie('token', token)
                    return res.json("Success")
                } else {
                    return res.json("Password is incorrect");
                }
            })
        } else {
            return res.json("User not exist")
        }
    })
})


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json("Success")
})


app.listen(3001, () => {
    console.log("Server is Running")
})