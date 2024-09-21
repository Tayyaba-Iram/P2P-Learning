import express from 'express'

const app = express()
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))
app.use(cookieParser())
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/P2P-Learning');


app.listen(3001, () => {
    console.log("Server is Running")
})