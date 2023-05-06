'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')
const checkToken = require('../middleware/checkToken')

const HomeController = require('../controllers/home')

const router = express.Router()


router.post('/create', checkToken, HomeController.createHome)
// router.get('/all', HomeController.getHomes)


module.exports = router
