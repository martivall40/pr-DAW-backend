'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')
const checkToken = require('../middleware/checkToken')

const LogController = require('../controllers/log')

const router = express.Router()


router.get('/all', checkToken, LogController.getAllLogs)
router.get('/device', checkToken, LogController.getDeviceLogs)
router.get('/provider', checkToken, LogController.getProviderLogs)


module.exports = router
