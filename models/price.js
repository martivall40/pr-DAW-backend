'use strict'

const mongoose = require('mongoose')

const PriceSchema = mongoose.Schema({
  data: Object,
  avg: Number,
  date: Date,
  link: String,
})

module.exports = mongoose.model('Price', PriceSchema)
