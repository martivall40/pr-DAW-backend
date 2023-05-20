'use strict'

const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
  date: { type:Date },
  message: { type: String },
  type:{ type: String },
  typeDevice:{ type: String },
  status:{ type: Boolean},
  device: {type: mongoose.Types.ObjectId, ref: "Device"},
  deviceName: { type: String },
  deviceType: { type: String },
  real: { type: Boolean},
})

module.exports = mongoose.model('Log', logSchema)
