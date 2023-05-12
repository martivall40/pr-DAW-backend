'use strict'

const Home = require('../models/home')
const User = require('../models/user')
const Device = require('../models/device')
const DeviceTypePlug = require('../models/deviceTypePlug')

const Relations = require('../models/relations')

const controller = {

  createDevice: function (req, res) {
    const homeId = req.params.id
    const userId = req.userId

    Home.findById(homeId).then((home) => {
      // comprovar usuari
      if (!home) return res.status(404).send({ message: 'No existeix l\'ubicació' })
      if (userId != home.user) return res.status(401).send({ message: 'Prohibit' })

      const device = new Device()
      device.name = req.body.name
      device.typeString = req.body.typeString.toLowerCase()
      device.virtual = req.body.virtual
      device.home = home

      let deviceType
      let collection

      if (device.typeString == 'plug') {
        collection = "deviceTypePlug"
        deviceType = new DeviceTypePlug()
        deviceType.type = "plug"
        deviceType.open = false
      } else{
        return res.status(500).send({ message: 'Falta el tipo de dispositiu' })
      }

      deviceType.save()
        .then(typeStored => {
          if(!typeStored)  return res.status(404).send({ message: 'No existeix el tipo' })

          device.deviceType = typeStored._id
          console.log("device.deviceType")
          console.log(device.deviceType)
          device.type = collection

          return device.save()
            .then(deviceStored => {
              if(!deviceStored)  return res.status(404).send({ message: 'No existeix el dispositiu' })
              return res.status(200).send({ device: deviceStored })})
            .catch(err => {
              console.log(err)
              res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
            })
        })
        .catch(err => {
          console.log(err)
          res.status(500).send({ message: 'ha fallat al crear el tipo de dispositiu' })
        })

    }).catch((err) => {
      console.log(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
    
  },

  getDevices: function (req, res) {

    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Device.find({user:userId}).then((device) => {
        
        if (!device) return res.status(404).send({ message: 'El dispositiu no existeix' })
  
        return res.status(200).send({
          device
        })
      }).catch((err) => {
        console.error(err)
        return res.status(500).send({ message: "'error al retornar les dadesa" })
        
      })
    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
  },


  getHomes: function (req, res) {

    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Home.find({user:userId}).then((home) => {
        
        if (!home) return res.status(404).send({ message: 'L\'ubicació no existeix' })

        return res.status(200).send({
          home
        })
      }).catch((err) => {
        console.error(err)
        return res.status(500).send({ message: "'error al retornar les dadesa" })
        
      })
    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
  },


  getHome: function (req, res) {

    const homeId = req.params.id
    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Home.find({user:userId,_id:homeId}).then((home) => {
        
        if (!home) return res.status(404).send({ message: 'L\'ubicació no existeix' })

        return res.status(200).send({
          home:home
        })
      }).catch((err) => {
        console.error(err)
        return res.status(500).send({ message: "'error al retornar les dadesa" })
        
      })
    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
  },

  updateHome: function (req, res) {
    const userId = req.userId
    const homeId = req.params.id
    const name = req.body.name
    const type = req.body.type

    Home.findById(homeId).then((home) => {
      // comprovar usuari
      if (!home) return res.status(404).send({ message: 'No existeix l\'ubicació' })
      if (userId != home.user) return res.status(401).send({ message: 'Prohibit' })

      return Home.findByIdAndUpdate(homeId, {name:name,type:type}, { new: true })
        .then(homeUpdated => {
          if(!homeUpdated)  return res.status(404).send({ message: 'No existeix l\'ubicació' })
          res.status(200).send({ home: homeUpdated })})
        .catch(err => res.status(500).send({ message: 'ha fallat al actualitzar l\'ubicació' }))

    }).catch((err) => {
      return res.status(500).send({ message: "Usuari no existent" })
    })

  },

  deleteHome: function (req, res) {
    const homeId = req.params.id
    const userId = req.userId

    Home.findById(homeId).then((home) => {
      // comprovar usuari
      if (!home) return res.status(404).send({ message: 'No existeix l\'ubicació' })
      if (userId != home.user) return res.status(401).send({ message: 'Prohibit' })

      return Home.findByIdAndDelete(homeId)
        .then(homeRemoved => {
          if(!homeRemoved)  return res.status(404).send({ message: 'No existeix l\'ubicació' })
          res.status(200).send({ home: homeRemoved })})
        .catch(err => res.status(500).send({ message: 'ha fallat al borrar l\'ubicació' }))

    }).catch((err) => {
      return res.status(500).send({ message: "Usuari no existent" })
    })


  },

}

module.exports = controller