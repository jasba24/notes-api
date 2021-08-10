const notesRouter = require('express').Router()
const Note = require('../models/Note')
const User = require('../models/User')
const UserExtractor = require('../middleware/UserExtractor')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
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

notesRouter.delete('/:id', UserExtractor, async (req, res, next) => {
  const id = req.params.id
  await Note.findByIdAndRemove(id)
  res.status(204).end()
})

notesRouter.put('/:id', UserExtractor, (req, res, next) => {
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

notesRouter.post('/', UserExtractor, async (req, res, next) => {
  const { content, important = false } = req.body

  const { userId } = req

  const user = await User.findById(userId)

  if (!content) {
    return res.status(400).json({
      error: 'Note.content is missing'
    })
  }

  const newNote = new Note({
    content: content,
    date: new Date().toISOString(),
    important: important,
    user: user._id
  })

  try {
    const saveNote = await newNote.save()
    user.notes = [...user.notes, saveNote._id]
    await user.save()
    res.status(201).json(saveNote)
  } catch (error) {
    next(error)
  }
})

module.exports = notesRouter
