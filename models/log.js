'use strict'

const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
  name: { type: String },
  type:{ type: String },
  device: {type: mongoose.Types.ObjectId, ref: "Device"},
})

module.exports = mongoose.model('Log', logSchema)
