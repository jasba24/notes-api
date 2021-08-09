const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    date: 1
  })
  res.json(users)
})

usersRouter.post('/', async (req, res) => {
  try {
    const { body } = req
    const { username, name, password } = body

    const usersDB = await User.find({})
    const users = await usersDB.map(u => u.toJSON())
    const usernames = users.map(u => u.username)

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      name,
      passwordHash
    })
    if (usernames.includes(username)) {
      res.status(400).send({ error: 'username to be unique' }).end()
    } else {
      const savedUser = await user.save()
      res.status(201).json(savedUser)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

usersRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  await User.findByIdAndRemove(id)
  res.status(204).end()
})

module.exports = usersRouter
