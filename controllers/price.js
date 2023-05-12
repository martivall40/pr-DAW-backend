'use strict'

const Price = require('../models/price')


const controller = {
  getPrices: function (req, res) {
    Price.find({}).then((price) => {
      
      if (!price) return res.status(404).send({ message: 'El projecte no existeix' })

      return res.status(200).send({
        price
      })
    }).catch((err) => {
      console.error(err)
      return res.status(500).send({ message: "'error al retornar les dades" })
      
    })
  },

  getLastPrice: function (req, res) {
    Price.find().sort({date:-1}).limit(1).then((price) => {
      
      if (!price) return res.status(404).send({ message: 'El projecte no existeix' })

      return res.status(200).send({
        price
      })
    }).catch((err) => {
      console.error(err)
      return res.status(500).send({ message: "'error al retornar les dades" })
      
    })
  },
}

module.exports = controller