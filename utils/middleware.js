const logger = require('./logger')

//Middleware on funktio, jolla voidaan käsitellä request- ja response-olioita. Normaali middleware on funktio, jolla on kolme parametria ja joka kutsuu lopuksi parametrina next olevaa funktiota:
const requestLogger = (req, res, next) => {
  logger.info('Pyynnön tyyppi: ', req.method)
  logger.info('Polku: ', req.path)
  logger.info('Runko: ', req.body)
  logger.info('---')
  next()
}

//hakee tokenin, joka on pyynnön Authorization-headerissa:
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  logger.info(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  next() //tästä siirtyy tarvittaessa errorHandleriin
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Tuntematon polku.' })
}

//Expressin virheidenkäsittelymiddlewarella on neljä parametria:
const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Id on väärän muotoinen.' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token'
    })
  }
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}