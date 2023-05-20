'use strict'

const User = require('../models/user')
const Log = require('../models/log')


const controller = {

  getAllLogs: function (req, res) {

    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Log.find().populate([{ path: 'device', populate: {path:'home', match:{user:  {$eq:userId}}}}  ]).sort([['date', -1]]).then((log) => {
        log = log.filter(l=>l.device.home!=null);
        
        if (!log) return res.status(404).send({ message: 'L\'ubicació no existeix' })


        return res.status(200).send({
          log
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

  getDeviceLogs: function (req, res) {

    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Log.find({real:false}).populate([{ path: 'device', populate: {path:'home', match:{user:  {$eq:userId}}}}  ]).sort([['date', -1]]).then((log) => {
        log = log.filter(l=>l.device.home!=null);
        
        if (!log) return res.status(404).send({ message: 'L\'ubicació no existeix' })


        return res.status(200).send({
          log
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

  getProviderLogs: function (req, res) {

    const userId = req.userId
    User.findById(userId).then((user) => {
      // console.log(user)

      if (!user) return res.status(404).send({ message: 'No existeix l\'usuari' })

      Log.find({real:true}).populate([{ path: 'device', populate: {path:'home', match:{user:  {$eq:userId}}}}  ]).sort([['date', -1]]).then((log) => {
        log = log.filter(l=>l.device.home!=null);
        
        if (!log) return res.status(404).send({ message: 'L\'ubicació no existeix' })


        return res.status(200).send({
          log
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




}

module.exports = controller