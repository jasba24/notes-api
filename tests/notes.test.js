const mongoose = require('mongoose')
const { server } = require('../index')
const Note = require('../models/Note')
const { initialNotes, api, getAllContentsFromNotes, getIdFromNote } = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany()

  for (const note of initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('GET all notes', () => {
  test('returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('if there are two notes', async () => {
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(initialNotes.length)
  })

  test('if the first note is about midudev', async () => {
    const { contents } = await getAllContentsFromNotes()
    expect(contents).toContain('Aprendiendo FullStack JS con midudev')
  })
})

describe('create a note', () => {
  test('is possible a valid note', async () => {
    const newNote = {
      content: 'Proximamente async/await',
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentsFromNotes()

    expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })

  test('is not possible with an invalid note', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(initialNotes.length)
  })
})

describe('delete a note', () => {
  test('is possible with a existing note', async () => {
    const id = await getIdFromNote()
    await api
      .delete(`/api/notes/${id}`)
      .expect(204)

    const { response } = await getAllContentsFromNotes()
    expect(response.body).toHaveLength(initialNotes.length - 1)
  })

  test('is not possible with a note that do not exist', async () => {
    await api
      .delete('/api/notes/dmiodiee')
      .expect(400)

    const { response } = await getAllContentsFromNotes()
    expect(response.body).toHaveLength(initialNotes.length)
  })
})

test('a note can be updated', async () => {
  const id = await getIdFromNote()
  const newNoteInfo = {
    content: 'No olvidas mi patreon',
    important: false
  }
  await api
    .put(`/api/notes/${id}`)
    .send(newNoteInfo)
    .expect(200)

  const { contents } = await getAllContentsFromNotes()
  expect(contents).toContain(newNoteInfo.content)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
