'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const scheduledFunctions = require('./scheduledFunctions/getPrice');

const app = express()

// a app.js CORS just abans de les rutes
// https://victorroblesweb.es/2018/01/31/configurar-acceso-cors-en-nodejs/

// Configurar capçaleress y cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Request-Method')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

// carregar rutes
const userRoutes = require('./routes/user')
const priceRoutes = require('./routes/price')
const homeRoutes = require('./routes/home')
const deviceRoutes = require('./routes/device')
const logRoutes = require('./routes/log')

// middlewares

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// rutes
app.use('/api/user', userRoutes)
app.use('/api/price', priceRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/device', deviceRoutes)
app.use('/api/log', logRoutes)

// carregar funcions programades
scheduledFunctions.initScheduledJobs()


module.exports = app
