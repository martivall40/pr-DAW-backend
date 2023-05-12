'use strict'

const mongoose = require('mongoose')

const deviceSchema = mongoose.Schema({
  name: { type: String },
  virtual: {type: Boolean, default: true},
  home: {type: mongoose.Types.ObjectId, ref: "Home"},


  typeString: { type: String },
  deviceType: { type: mongoose.Types.ObjectId, refPath: "type"}, // id document
  type: { type: String, required: true, enum: ['deviceTypePlug']}, // deviceTypePlug

  providerString: { type: String },
  deviceProvider: {type: mongoose.Types.ObjectId, refPath: "provider"},
  provider: { type: String, enum: ['tuya']},


})

module.exports = mongoose.model('Device', deviceSchema)
