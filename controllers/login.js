const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (req, res) => {
  const { body } = req
  const { username, password } = body

  const user = await User.findOne({ username })
  const isPasswordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!user && isPasswordCorrect) {
    res.status(401).json({
      error: 'invalid user o password'
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username
  }

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60 * 24 * 7
  })

  res.send({
    name: user.name,
    username: user.username,
    token
  })
})

module.exports = loginRouter