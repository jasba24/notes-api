const mongoose = require('mongoose')
const { Schema, model } = mongoose

const password = require('./password')

const connectionString =
`mongodb+srv://jasba24:${password}@cluster0.vdvkq.mongodb.net/midubootcamp?retryWrites=true&w=majority`

// connection to mongodb
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
})
  .then(() => {
    console.log('DB connected')
  })
  .catch(err => console.log(err))

const noteSchema = new Schema({
  content: String,
  date: Date,
  important: Boolean
})

const Note = model('Note', noteSchema)

// Note.find({}).then(result => {
//   console.log(result)
//   mongoose.connection.close()
// })

const note = new Note({
  content: 'MongoDB es increible, midu',
  date: new Date(),
  important: true
})

note.save()
  .then((result) => {
    console.log(result)
    mongoose.connection.close()
  })
  .catch(err => console.error(err))
