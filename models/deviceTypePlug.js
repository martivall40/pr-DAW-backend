'use strict'

const mongoose = require('mongoose')

const deviceTypePlugSchema = mongoose.Schema({
  type: { type: String },
  open: {type: Boolean},
})

module.exports = mongoose.model('DeviceTypePlug', deviceTypePlugSchema)
