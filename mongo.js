const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

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

process.on('uncaughtException', () => mongoose.connection.disconnect())
