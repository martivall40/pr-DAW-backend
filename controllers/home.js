'use strict'

const Home = require('../models/home')
const User = require('../models/user')


const controller = {
  createHome: function (req, res) {
    
    const userId = req.userId
    User.findById(userId).then((user,as) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      const home = Home()
      const params = req.body
      home.name = params.name
      home.type = params.type
      home.user = user
      console.log("req.body")
      console.log(req.body)
      
      return home.save()
          .then(home => console.log('The home ' + home.screenName + ' has been added.'))
          .catch(err => handleError(err))
          .finally(() => home.db.close());
    
      home.save((err, homeStored) => {
        if (err) return res.status(500).send({ message: 'ha fallat al guardar una ubicació' })

        if (!homeStored) return res.status(404).send({ message: 'ha fallat al guardar una ubicació' })

        return res.status(200).send({ home: homeStored })
      })


    }).catch((err) => {
      // console.error(err)
      return res.status(500).send({ message: "Usuari no existent" })
    })
    


  },
  getHomes: function (req, res) {
    Home.find({}).then((home) => {
      
      if (!home) return res.status(404).send({ message: 'L\'ubicació no existeix' })

      return res.status(200).send({
        home
      })
    }).catch((err) => {
      console.error(err)
      return res.status(500).send({ message: "'error al retornar les dadesa" })
      
    })
  },

  updateHome: function (req, res) {
    const homeId = req.params.id
    const update = req.body

    Home.findByIdAndUpdate(homeId, update, { new: true }, (err, homeUpdated) => {
      if (err) return res.status(500).send({ message: 'Error actualizant les dades' })

      if (!homeUpdated) return res.status(404).send({ message: 'No existeix l\'ubicació' })

      return res.status(200).send({ home: homeUpdated })
    })
  },

  deleteHome: function (req, res) {
    const homeId = req.params.id
    Home.findByIdAndDelete(homeId, (err, homeRemoved) => {
      if (err) return res.status(500).send({ message: "Error: no s'ha pogut borrar l\'ubicació" })

      if (!homeRemoved) return res.status(404).send({ message: 'No existeix l\'ubicació a borrar' })

      return res.status(200).send({ home: homeRemoved })
    })
  },

}

module.exports = controller