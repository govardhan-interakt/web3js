const express = require('express')
const ether = require('./routes/ether')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()

app.use(bodyParser.json())


app.use('/',ether)



const PORT  =process.env.PORT


app.listen(PORT,()=>{
    console.log(`Listening: http://localhost:${PORT}`)
})