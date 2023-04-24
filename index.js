'use strict'

const mongoose = require('mongoose')
require('dotenv').config()

const app = require('./app')

const connString = process.env.MONGODB_URI
const port = process.env.PORT

mongoose.Promise = global.Promise
mongoose.connect(connString)
  .then(() => {
    console.log('> Server: db connected')

    // server
    app.listen(port, () => {
      console.log(`> Server: server on port ${port}`)
    })
  })
  .catch(err => {
    console.log(err)
  })
