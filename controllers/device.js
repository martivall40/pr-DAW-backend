'use strict'

const Home = require('../models/home')
const User = require('../models/user')
const Log = require('../models/log')
const Device = require('../models/device')
const DeviceTypePlug = require('../models/deviceTypePlug')
const DeviceTypeLight = require('../models/deviceTypeLight')
const ProviderTuya = require('../models/providerTuya')
const ProviderTuyaTypePlug = require('../models/providerTuyaTypePlug')

const TuyAPI = require('tuyapi');

// const Relations = require('../models/relations')


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
        deviceProvider.id = req.body.id
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

    Device.findById(deviceId).populate([{path:'home'},{path:'deviceType'},{path:"deviceProvider", populate: {path:'deviceType'}}]).then((device) => {
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
      log.real = false
      log.date = new Date()


      let collectionProvider = null
      let providerType = null
      if(device.real){
        
        if(device.providerString === 'tuya'){
          collectionProvider = ProviderTuya
          device.deviceProvider.deviceType.open = log.status

          if(device.deviceProvider.deviceType.type == "plug"){
            providerType = ProviderTuyaTypePlug

            if(!device.deviceProvider.key) return res.status(404).send({ message: 'Falta KEY de tuya' })
            if(!device.deviceProvider.id) return res.status(404).send({ message: 'Falta ID de tuya' })

            const RealDevice = new TuyAPI({
              id: device.deviceProvider.id,
              key: device.deviceProvider.key,
              issueGetOnConnect: false});
            
            (async () => {
              await RealDevice.find();
              
              await RealDevice.connect();
              
            
            
              // let status = await RealDevice.get();
            
              // console.log(`Current status: ${status}.`);
            
              await RealDevice.set({set: open.open});


              if (device.real ) {   

                if (collectionProvider!=null){
                  // console.log(device)
                  // return res.status(200).send({ deviceType: deviceSaved })
                  // collectionProvider.findById()
    
                  const logR = Log()
                  logR.message = `Canviat estat Real del ${device.typeString} ${device.name} a ${(open.open)? 'obert':'tancat'}`
                  logR.type = (open.open)? 'Obrir':'Tancar'
                  logR.typeDevice = device.typeString
                  logR.status = open.open
                  logR.device = device
                  logR.deviceName = device.name
                  logR.real = true
                  logR.date = new Date()
    
                  logR.save().then(logStored => {
            
                    if (!logStored) return res.status(404).send({ message: 'alguna cosa ha fallat' })
    
                      // guardar estat
                    providerType.findByIdAndUpdate(device.deviceProvider.deviceType._id,open,{new:true})
                    .then(typeSaved => {
                      if(!typeSaved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
                      
                      return res.status(200).send({ deviceType: typeSaved })
                    
                    }).catch(err => res.status(500).send({ message: 'ha fallat al actualitzar el proveidor' }))
                    
                  }).catch(err => {
                    console.log(err)
                    return res.status(500).send({ message: 'ha fallat al guardar el log real' })
                  })
    
    
                }else{return res.status(401).send({ message: 'Error en actualitzar dispositiu' })}
    
              }


            
              // status = await RealDevice.get();
            
              // console.log(`New status: ${status}.`);
            
                
              RealDevice.disconnect();
             
            })();
            
            
            /* const RealDevice = new TuyAPI({
              id: device.deviceProvider.id, // 'bf4c1fda6abb57749e6azp'
              key: device.deviceProvider.key}); //`P8QCkgv3zkEcUNV

              // Find device on network
              RealDevice.find().then(() => {
                // Connect to device
                RealDevice.connect();
              });

              // Add event listeners
              RealDevice.on('connected', () => {
                console.log('Connected to device!');
              });

              RealDevice.on('disconnected', () => {
                console.log('Disconnected from device.');
                return res.status(404).send({ message: 'Ha fallat la conexió del dispositiu' })
              });

              RealDevice.on('error', error => {
                console.log('Error!', error);
                return res.status(404).send({ message: 'Ha fallat la conexió del dispositiu' })
              });

              RealDevice.on('data', data => {
                console.log('Data from device:', data);
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                console.log(`Boolean status of default property: ${data.dps['1']}.`);

                // canviar estat
                RealDevice.set({set: open.open});


                if (device.real) {   

                  if (collectionProvider!=null){
                    // console.log(device)
                    // return res.status(200).send({ deviceType: deviceSaved })
                    // collectionProvider.findById()
      
                    const logR = Log()
                    logR.message = `Canviat estat Real del ${device.typeString} ${device.name} a ${(open.open)? 'obert':'tancat'}`
                    logR.type = (open.open)? 'Obrir':'Tancar'
                    logR.typeDevice = device.typeString
                    logR.status = open.open
                    logR.device = device
                    logR.deviceName = device.name
                    logR.real = true
                    logR.date = new Date()
      
                    logR.save().then(logStored => {
              
                      if (!logStored) return res.status(404).send({ message: 'alguna cosa ha fallat' })
      
                        // guardar estat
                      providerType.findByIdAndUpdate(device.deviceProvider.deviceType._id,open,{new:true})
                      .then(typeSaved => {
                        if(!typeSaved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
                        
                        return res.status(200).send({ deviceType: typeSaved })
                      
                      }).catch(err => res.status(500).send({ message: 'ha fallat al actualitzar el proveidor' }))
                      
                    }).catch(err => {
                      console.log(err)
                      return res.status(500).send({ message: 'ha fallat al guardar el log real' })
                    })
      
      
                  }else{return res.status(401).send({ message: 'Error en actualitzar dispositiu' })}
      
                }


              });

              // Disconnect after 10 seconds
              setTimeout(() => { RealDevice.disconnect(); }, 10000); */



          }
        }
      }

      // guardar log
      log.save().then(logStored => {
        
        if (!logStored) return res.status(404).send({ message: 'alguna cosa ha fallat' })
        
        // guardar estat
        collectionType.findByIdAndUpdate(device.deviceType._id,open,{new:true})
        .then(typeSaved => {
          if(!typeSaved)  return res.status(404).send({ message: 'No existeix el dispositiu' })
          if (!device.real) return res.status(200).send({ deviceType: typeSaved })
          if (device.real && collectionProvider==null) return res.status(200).send({ deviceType: typeSaved })
        
        
          
        
        })

          
        .catch(err => {
          console.log(err)
          // console.log(err.message)
          // if (err.error.message)
          return res.status(500).send({ message: 'ha fallat al afegir el log virtualitzat' })
        })
        
      }).catch(err => {
        // console.log(err.error.message)
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
      // Object.getOwnPropertyNames(err)
      // console.log(err.message)
      if(err.message="Key is missing or incorrect."){
        return res.status(500).send({ message: "KEY del dispositiu invalida" })
      }
      // console.log(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })


  },

}

module.exports = controller