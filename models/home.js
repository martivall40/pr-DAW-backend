'use strict'

const mongoose = require('mongoose')

const homeSchema = mongoose.Schema({
  name: { type: String },
  type:{ type: String },
  user: {type: mongoose.Types.ObjectId, ref: "User"},
})

module.exports = mongoose.model('Home', homeSchema)
