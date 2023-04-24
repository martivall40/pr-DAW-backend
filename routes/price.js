'use strict'

const express = require('express')

const checkAuth = require('../middleware/check-auth')

const PriceController = require('../controllers/price')

const router = express.Router()

// const multipart = require('connect-multiparty')
// const multipartMiddleware = multipart({ uploadDir: './uploads' })

router.get('/all', PriceController.getPrices)

// router.get('/home', ProjectController.home)
// router.post('/test', ProjectController.test)
// router.post('/save-project', checkAuth, ProjectController.saveProject)

// router.get('/project/:id?', ProjectController.getProject)
// router.get('/projects', ProjectController.getProjects)

// router.put('/project/:id?', checkAuth, ProjectController.updateProject)
// router.delete('/project/:id?', checkAuth, ProjectController.deleteProject)

// router.post('/upload-image/:id', multipartMiddleware, ProjectController.uploadImage)
// router.get('/get-image/:image', multipartMiddleware, ProjectController.getImage)

module.exports = router
