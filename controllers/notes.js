const notesRouter = require('express').Router()
const Note = require('../models/Note')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({})
  res.json(notes)
})

notesRouter.get('/:id', (req, res, next) => {
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

notesRouter.delete('/:id', async (req, res, next) => {
  const id = req.params.id
  await Note.findByIdAndRemove(id)
  res.status(204).end()
})

notesRouter.put('/:id', (req, res, next) => {
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

notesRouter.post('/', async (req, res, next) => {
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

module.exports = notesRouter
