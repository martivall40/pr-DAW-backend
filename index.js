'use strict'

const mongoose = require('mongoose')
require('dotenv').config()

const app = require('./app')

const connString = process.env.MONGODB_URI
const port = process.env.PORT

mongoose.Promise = global.Promise
conexio()
function conexio(){
  mongoose.connect(connString)
    .then(() => {
      console.log('> Server: db connected')

      // server
      app.listen(port, () => {
        console.log(`> Server: server on port ${port}`)
      })
    })
    .catch(err => {
      if(err.name == "MongooseServerSelectionError" && /connect ETIMEDOUT/.test(err.message) ){
        console.log("> Server: Ha fallat la conexió a la db, reintentant...")
        conexio()
      }else{
        console.log(err)
        console.log("> Server: Ha fallat al connectar-se amb la db")
      }
      
  })
}