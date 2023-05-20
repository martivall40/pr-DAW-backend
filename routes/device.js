'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')
const checkToken = require('../middleware/checkToken')

const DeviceController = require('../controllers/device')

const router = express.Router()


router.post('/create/:id', checkToken, DeviceController.createDevice)
router.get('/all', checkToken, DeviceController.getDevices)
router.get('/home/:id', checkToken, DeviceController.getDevicesByHome)

router.put('/:id?', checkToken, DeviceController.updateDevice)
// router.get('/:id?', checkToken, DeviceController.getDevice)
router.delete('/:id?', checkToken, DeviceController.deleteDevice)

router.get('/swapStatus/:id', checkToken, DeviceController.swapStatus)


module.exports = router
