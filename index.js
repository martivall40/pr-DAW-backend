'use strict'

const mongoose = require('mongoose')
require('dotenv').config()

const app = require('./app')

const connString = process.env.MONGODB_URI
const port = process.env.PORT

mongoose.Promise = global.Promise
mongoose.connect(connString)
  .then(() => {
    console.log('db conectada')

    // server
    app.listen(port, () => {
      console.log(`servidor port: ${port}`)
    })
  })
  .catch(err => {
    console.log(err)
  })
