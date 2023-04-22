'use strict'

const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
// const Schema = mongoose.Schema

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)
