'use strict'

const Price = require('../models/price')


const controller = {
  getPrices: function (req, res) {
    Price.find({}).exec((err, price) => {
      console.log(price)
      if (err) {
        console.log(err)
        return res.status(500).send({ message: "'error al retornar les dades" })
      }

      if (!price) return res.status(404).send({ message: 'El projecte no existeix' })

      return res.status(200).send({
        price
      })
    })
  },
}

module.exports = controller