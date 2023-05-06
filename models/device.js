'use strict'

const mongoose = require('mongoose')

const deviceSchema = mongoose.Schema({
  name: { type: String },
  virtual: {type: Boolean, default: true},
  home: {type: mongoose.Types.ObjectId, ref: "Home"},

  deviceType: { type: mongoose.Types.ObjectId, refPath: "type"},
  type: { type: String, required: true},

  // provider: {type: mongoose.Types.ObjectId, refPath: "provider"},
  // type: { type: String, required: true},


})

module.exports = mongoose.model('Device', deviceSchema)
