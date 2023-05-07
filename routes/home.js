'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')
const checkToken = require('../middleware/checkToken')

const HomeController = require('../controllers/home')

const router = express.Router()


router.post('/create', checkToken, HomeController.createHome)
router.get('/all', checkToken, HomeController.getHomes)

router.put('/:id?', checkToken, HomeController.updateHome)
// router.get('/home/:id?', checkToken, HomeController.getHome)
router.delete('/:id?', checkToken, HomeController.deleteHome)

module.exports = router
