module.exports = (error, req, res, next) => {
  console.log(error.name)
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'Id used is malformed' })
  } else {
    res.status(500).end()
  }
}
