const ERROR_HANDLERS = {
  CastError: res => res.status(400).send({ error: 'Id used is malformed' }),
  ValidationError: (res, { message }) => res.status(400).send({ error: message }),
  JsonWebTokenError: res => res.status(401).json({ error: 'token missing or invalid' }),
  TokenExpirerError: res => res.status(401).json({ error: 'token expiredw' }),
  defaultError: res => res.status(500).end()
}

module.exports = (error, req, res, next) => {
  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
  handler(res, error)
}
