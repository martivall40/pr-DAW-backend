'use strict'

const Home = require('../models/home')
const User = require('../models/user')
const Log = require('../models/log')
const Device = require('../models/device')
const DeviceTypePlug = require('../models/deviceTypePlug')
const DeviceTypeLight = require('../models/deviceTypeLight')
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
        collectionType = "DeviceTypePlug"
        deviceType = new DeviceTypePlug()
        deviceType.type = "plug"
        deviceType.open = false
      }else if (device.typeString == 'light') {
        collectionType = "DeviceTypeLight"
        deviceType = new DeviceTypeLight()
        deviceType.type = "light"
        deviceType.open = false

      }else if (device.typeString == 'esp32'){
        return device.save()
          .then(deviceStored => {
            if(!deviceStored)  return res.status(404).send({ message: 'No existeix el dispositiu' })
            return res.status(200).send({ device: deviceStored })})
          .catch(err => {
            console.log(err)
            res.status(500).send({ message: 'ha fallat al crear el dispositiu' })
          })
         
      } else{
        return res.status(500).send({ message: 'Falta el tipo de dispositiu' })
      }

      // afegir tipus de proveidor i tipus
      if (device.providerString == 'tuya') {
        collectionProvider = "ProviderTuya"
        deviceProvider = new ProviderTuya()
        deviceProvider.key = req.body.key
        deviceProvider.open = false

        if(device.typeString == 'plug'){
        collectionProviderType = "ProviderTuyaTypePlug"
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
        Device.find().populate([{ path: 'home', match:{user:  {$eq:userId}}}, {path:'deviceType'}  ]).then((device) => {
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
        Device.find({home:homeId}).populate([{ path: 'home', match:{user:  {$eq:userId}}},{path:'deviceType'}  ]).then((device) => {
        
        device = device.filter(dev=>dev.home!=null);

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
      return res.status(500).send({ message: "Alguna cosa ha fallat" })
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

  swapStatus: function (req, res) {
    const deviceId = req.params.id
    const userId = req.userId

    Device.findById(deviceId).populate([{path:'home'},{path:'deviceType'}]).then((device) => {
      // comprovar usuari
      if (!device) return res.status(404).send({ message: 'No existeix el dispositiu' })
      if (userId != device.home.user) return res.status(401).send({ message: 'Prohibit' })
      
      let collectionType

      if (device.typeString == "plug"){
        collectionType = DeviceTypePlug
      }else if (device.typeString == "light"){
        collectionType = DeviceTypeLight
      }else{return res.status(401).send({ message: 'Error' })}
        

      let open={open:!device.deviceType.open}

      const log = Log()
      log.message = `Canviat estat del ${device.typeString} ${device.name} a ${(open.open)? 'obert':'tancat'}`
      log.type = (open.open)? 'Obrir':'Tancar'
      log.typeDevice = device.typeString
      log.status = open.open
      log.device = device
      log.deviceName = device.name
      log.real = device.real
      log.date = new Date()

      // guardar log
      log.save().then(logStored => {
        
        if (!logStored) return res.status(404).send({ message: 'alguna cosa ha fallat' })
        
        // guardar estat
        return collectionType.findByIdAndUpdate(device.deviceType._id,open,{new:true})
        .then(deviceSaved => {
          if(!deviceSaved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
          res.status(200).send({ deviceType: deviceSaved })})
        .catch(err => res.status(500).send({ message: 'ha fallat al borrar el dispositiu' }))
        
      }).catch(err => {
        console.error(err)
        return res.status(500).send({ message: 'alguna cosa ha fallat' })
      })


      

      // return res.status(200).send({ device: device })

      /* return Device.findByIdAndUpdate(deviceId,device,{new:true}).populate('deviceType')
        .then(deviceSaved => {
          if(!deviceSaved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
          res.status(200).send({ device: deviceSaved })})
        .catch(err => res.status(500).send({ message: 'ha fallat al borrar el dispositiu' })) */

    }).catch((err) => {
      return res.status(500).send({ message: "Usuari no existent" })
    })


  },

}

module.exports = controller