const express = require('express')
const ether = require('./routes/ether')
require('dotenv').config()
const app = express()




app.use('/',ether)






const PORT  =process.env.PORT


app.listen(PORT,()=>{
    console.log(`Listening: http://localhost:${PORT}`)
})