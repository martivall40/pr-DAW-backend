'use strict'

const Home = require('../models/home')
const User = require('../models/user')


const controller = {
  createHome: function (req, res) {
    
    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      const home = Home()
      const params = req.body
      home.name = params.name
      home.type = params.type
      home.user = user

    
      home.save().then(homeStored => {
        
        if (!homeStored) return res.status(404).send({ message: 'ha fallat al guardar una ubicació' })
        
        return res.status(200).send({ home: homeStored })
        
      }).catch(err => {
        return res.status(500).send({ message: 'ha fallat al guardar una ubicació' })
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