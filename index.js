require('dotenv').config()
require('./mongo')

const Note = require('./models/Note')
const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')

const app = express()

Sentry.init({
  dsn: 'https://7b7e29db88d6436a8798e4823b7d81bc@o945880.ingest.sentry.io/5894600',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

const logger = require('./loggerMiddleware')
const cors = require('cors')
const NotFound = require('./middleware/NotFound')
const CastError = require('./middleware/CastError')

app.use(logger)
app.use(cors())
app.use(express.json())

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/api/notes', async (req, res) => {
  const notes = await Note.find({})
  res.json(notes)
})

app.get('/api/notes/:id', (req, res, next) => {
  const id = req.params.id
  Note.findById(id)
    .then(note => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.delete('/api/notes/:id', async (req, res, next) => {
  const id = req.params.id
  await Note.findByIdAndRemove(id)
  res.status(204).end()
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

app.post('/api/notes', async (req, res, next) => {
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

  try {
    const saveNote = await newNote.save()
    res.status(201).json(saveNote)
  } catch (error) {
    next(error)
  }
})

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler())

app.use(NotFound)
app.use(CastError)

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = { app, server }
