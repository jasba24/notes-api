module.exports = (error, req, res, next) => {
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'Id used is malformed' })
  } else {
    res.status(500).end()
  }
}
