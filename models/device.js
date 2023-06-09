'use strict'

const mongoose = require('mongoose')

const deviceSchema = mongoose.Schema({
  name: { type: String },
  real: {type: Boolean, default: false},
  home: {type: mongoose.Types.ObjectId, ref: "Home"},


  typeString: { type: String },
  deviceType: { type: mongoose.Types.ObjectId, refPath: "type"}, // id document
  type: { type: String, enum: ['DeviceTypePlug','DeviceTypeLight']}, // deviceTypePlug

  providerString: { type: String },
  deviceProvider: {type: mongoose.Types.ObjectId, refPath: "provider"},
  provider: { type: String, enum: ['ProviderTuya']},


})

module.exports = mongoose.model('Device', deviceSchema)
