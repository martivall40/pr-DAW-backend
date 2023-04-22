'use strict'

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const secret = process.env.SECRET

const User = require('../models/user')

const router = express.Router()

// login
router.post('/login', (req, res, next) => {
  console.log('login')
  let fetchedUser
  console.log(req.body.email)
  console.log(req.body.username)
  console.log(req.body.password)
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed'
        })
      }

      fetchedUser = user
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      // crear token
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        secret,
        { expiresIn: '1h' }
      )
      res.status(200).json({
        token,
        expiresIn: 3600
      })
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      })
    })
})

// registrar
router.post('/signup', (req, res, next) => {
  console.log('signup')
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      username: req.body.username,
      password: hash
    })
    user
      .save()
      .then(result => {
        res.status(201).json({
          message: 'User creat',
          result
        })
      })
      .catch(err => {
        res.status(500).json({
          error: err
        })
      })
  })
})

module.exports = router
