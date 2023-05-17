'use strict'

const mongoose = require('mongoose')

const providerTuyaSchema = mongoose.Schema({
  key: { type: String },
  

  typeString: { type: String },
  deviceType: { type: mongoose.Types.ObjectId, refPath: "type"}, // id document
  type: { type: String, required: true, enum: ['providerTuyaTypePlug']}, // deviceTypePlug


  // una sola collecio
  //deviceType: { type: mongoose.Types.ObjectId, ref: "nom_collecio"}, // id document



})

module.exports = mongoose.model('providerTuya', providerTuyaSchema)
