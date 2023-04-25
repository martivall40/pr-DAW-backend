'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')

const PriceController = require('../controllers/price')

const router = express.Router()

// const multipart = require('connect-multiparty')
// const multipartMiddleware = multipart({ uploadDir: './uploads' })

router.get('/all', PriceController.getPrices)
router.get('/last', PriceController.getLastPrice)


module.exports = router
