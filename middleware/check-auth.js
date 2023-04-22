const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.SECRET

module.exports = (req, res, next) => {
  try {
    // agafar header token
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, secret)
    next()
  } catch (error) {
    res.status(401).json({ message: 'auth failed' })
  }
}
