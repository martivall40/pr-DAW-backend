'use strict'

const Home = require('../models/home')
const User = require('../models/user')
const Device = require('../models/device')
const DeviceTypePlug = require('../models/deviceTypePlug')
const ProviderTuya = require('../models/providerTuya')
const ProviderTuyaTypePlug = require('../models/providerTuyaTypePlug')

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
      // console.log(req.body)
      device.name = req.body.name
      device.typeString = req.body.typeString?.toLowerCase()
      device.real = req.body.real ? req.body.real : false
      device.home = home
      device.providerString = req.body.providerString?.toLowerCase()


      let deviceType
      let collectionType

      let deviceProvider = null
      let collectionProvider

      let providerType = null
      let collectionProviderType = null



      // afegir tipus de dispositiu general
      if (device.typeString == 'plug') {
        collectionType = "deviceTypePlug"
        deviceType = new DeviceTypePlug()
        deviceType.type = "plug"
        deviceType.open = false
      } else{
        return res.status(500).send({ message: 'Falta el tipo de dispositiu' })
      }

      // afegir tipus de proveidor i tipus
      if (device.providerString == 'tuya') {
        collectionProvider = "providerTuya"
        deviceProvider = new ProviderTuya()
        deviceProvider.key = req.body.key
        deviceProvider.open = false

        if(device.typeString == 'plug'){
        collectionProviderType = "providerTuyaTypePlug"
        providerType = new ProviderTuyaTypePlug()
        providerType.type = "plug"
        providerType.open = false

        }

      } 

      // primer guardar tipus de dispositiu 
      deviceType.save()
        .then(typeStored => {
          if(!typeStored)  return res.status(404).send({ message: 'No s\'ha pogut guardar' })

          device.deviceType = typeStored._id
          device.type = collectionType

          // comprovar si hi ha provider i tipus per guardar

          if(deviceProvider && providerType){

            providerType.save().then(providerTypeSaved =>{
              if(!providerTypeSaved)  return res.status(404).send({ message: 'No s\'ha pogut guardar' })

              deviceProvider.deviceType = providerTypeSaved._id
              deviceProvider.type = collectionProviderType

              deviceProvider.save().then(providerStored => {
                if(!providerStored)  return res.status(404).send({ message: 'No existeix el tipo' })
                 
                device.deviceProvider = providerStored._id
                device.provider = collectionProvider

                return device.save()
                  .then(deviceStored => {
                    if(!deviceStored)  return res.status(404).send({ message: 'No existeix el dispositiu' })
                    return res.status(200).send({ device: deviceStored })})
                  .catch(err => {
                    console.log(err)
                    res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
                })
              
              }).catch(err => {
                console.log(err)
                res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
              })

            }).catch(err => {
              console.log(err)
              res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
            })


          // sense provider
          }else{

            return device.save()
            .then(deviceStored => {
              if(!deviceStored)  return res.status(404).send({ message: 'No existeix el dispositiu' })
              return res.status(200).send({ device: deviceStored })})
            .catch(err => {
              console.log(err)
              res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
            })
          }

          
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
    console.log(userId)
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      
        // Device.find().populate('home',null,{user:userId}).then((device) => {
        Device.find().populate({ path: 'home', match:{user:  {$eq:userId}}  }).then((device) => {
        // Device.find().populate('home', {path: 'home',match: { user: userId }}).then((device) => {

        device = device.filter(dev=>dev.home!=null)
        
        if (!device) return res.status(404).send({ message: 'El dispositiu no existeix' })
  
        return res.status(200).send({
          device
        })
      }).catch((err) => {
        console.error(err)
        return res.status(500).send({ message: "error al retornar les dades" })
        
      })
    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
  },

  getDevicesByHome: function (req, res) {
    const homeId = req.params.id
    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      // Device.find({home:homeId}).then((device) => {
        Device.find({home:homeId}).populate({ path: 'home', match:{user:  {$eq:userId}}  }).then((device) => {
        
        // device = device.filter(dev=>dev.home!=null);

        if (!device) return res.status(404).send({ message: 'El dispositiu no existeix' })
  
        return res.status(200).send({
          device
        })
      }).catch((err) => {
        console.error(err)
        return res.status(500).send({ message: "error al retornar les dades" })
        
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
        return res.status(500).send({ message: "error al retornar les dades" })
        
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
        return res.status(500).send({ message: "error al retornar les dadesa" })
        
      })
    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
  },

  updateDevice: function (req, res) {
    const userId = req.userId
    const deviceId = req.params.id
    const name = req.body.name
    const type = req.body.type

    Device.findById(deviceId).populate('home').then((device) => {
      // comprovar usuari
      if (!device) return res.status(404).send({ message: 'No existeix el dispositiu' })
      if (userId != home.user) return res.status(401).send({ message: 'Prohibit' })

      return Device.findByIdAndUpdate(deviceId, {name:name,type:type}, { new: true })
        .then(deviceUpdated => {
          if(!deviceUpdated)  return res.status(404).send({ message: 'No existeix el dispositiu' })
          res.status(200).send({ device: deviceUpdated })})
        .catch(err => res.status(500).send({ message: 'ha fallat al actualitzar el dispositiu' }))

    }).catch((err) => {
      return res.status(500).send({ message: "Usuari no existent" })
    })

  },

  deleteDevice: function (req, res) {
    const deviceId = req.params.id
    const userId = req.userId

    Device.findById(deviceId).populate('home').then((device) => {
      // comprovar usuari
      if (!device) return res.status(404).send({ message: 'No existeix el dispositiu' })
      if (userId != device.home.user) return res.status(401).send({ message: 'Prohibit' })

      return Device.findByIdAndDelete(deviceId)
        .then(deviceRemoved => {
          if(!deviceRemoved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
          res.status(200).send({ device: deviceRemoved })})
        .catch(err => res.status(500).send({ message: 'ha fallat al borrar el dispositiu' }))

    }).catch((err) => {
      return res.status(500).send({ message: "Usuari no existent" })
    })


  },

}

module.exports = controller