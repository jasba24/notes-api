require('dotenv').config()
require('./mongo')

const Note = require('./models/Note')
const express = require('express')
const app = express()
const logger = require('./loggerMiddleware')
const cors = require('cors')
const NotFound = require('./middleware/NotFound')
const CastError = require('./middleware/CastError')

app.use(logger)
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send(`
  <div>
    <h1>Hello World</h1>
    <h2>GET <a href="/api/notes">/api/notes</a></h2>
  </div>`)
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  Note.findById(id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  })
    .catch(err => {
      next(err)
    })
})

app.delete('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  Note.findByIdAndRemove(id).then(result => {
    res.status(204).end()
  }).catch(err => next(err))
})

app.put('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  const note = req.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }
  Note.findByIdAndUpdate(id, newNoteInfo, { new: true }).then(result => {
    res.json(result)
  }).catch(err => next(err))
})

app.post('/api/notes', (req, res) => {
  const note = req.body

  if (!note || !note.content) {
    return res.status(400).json({
      error: 'Note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date().toISOString(),
    important: typeof note.important !== 'undefined' ? note.important : false
  })

  newNote.save().then(saveNote => {
    res.status(201).json(saveNote)
  })
})

app.use(NotFound)

app.use(CastError)

const PORT = process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
