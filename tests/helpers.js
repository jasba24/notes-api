const supertest = require('supertest')
const { app } = require('../index')
const User = require('../models/User')

const api = supertest(app)
const initialNotes = [
  {
    content: 'Aprendiendo FullStack JS con midudev',
    important: true,
    date: new Date()
  },
  {
    content: 'Sigueme en https://midu.tube',
    important: true,
    date: new Date()
  },
  {
    content: 'Gracias al chat por vuestra ayuda',
    important: true,
    date: new Date()
  }
]

const getAllContentsFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const getIdFromNote = async () => {
  const response = await api.get('/api/notes/')
  return response.body[0].id
}

const getUser = async () => {
  const usersDB = await User.find({})
  return usersDB.map(u => u.toJSON())
}

module.exports = { initialNotes, api, getAllContentsFromNotes, getIdFromNote, getUser }
