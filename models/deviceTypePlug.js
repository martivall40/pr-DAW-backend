'use strict'

const mongoose = require('mongoose')

const deviceTypePlugSchema = mongoose.Schema({
  type: { type: String },
  open: {type: Boolean},


  // varias:
  // deviceType: { type: mongoose.Types.ObjectId, refPath: "type"}, // id document
  // type: { type: String, required: true}, // deviceTypePlug


  // una sola collecio
  //deviceType: { type: mongoose.Types.ObjectId, ref: "nom_collecio"}, // id document



})

module.exports = mongoose.model('DeviceTypePlug', deviceTypePlugSchema)
