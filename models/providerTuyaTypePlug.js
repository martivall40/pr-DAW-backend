'use strict'

const mongoose = require('mongoose')

const providerTuyaTypePlugSchema = mongoose.Schema({
  type: { type: String },
  open: {type: Boolean},

})

module.exports = mongoose.model('ProviderTuyaTypePlug', providerTuyaTypePlugSchema)
