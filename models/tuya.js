'use strict'

const mongoose = require('mongoose')

const tuyaSchema = mongoose.Schema({
  key: { type: String },
  

  typeString: { type: String },
  deviceType: { type: mongoose.Types.ObjectId, refPath: "type"}, // id document
  type: { type: String, required: true, enum: ['tuyaTypePlug']}, // deviceTypePlug


  // una sola collecio
  //deviceType: { type: mongoose.Types.ObjectId, ref: "nom_collecio"}, // id document



})

module.exports = mongoose.model('Tuya', deviceSchema)
