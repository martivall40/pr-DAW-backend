'use strict'

const mongoose = require('mongoose')

const deviceTypeLightSchema = mongoose.Schema({
  type: { type: String },
  open: {type: Boolean},

})

module.exports = mongoose.model('DeviceTypeLight', deviceTypeLightSchema)
