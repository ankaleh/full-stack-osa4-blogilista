const logger = require('./logger')

const requestLogger = (req, res, next) => {
    logger.info('Pyynnön tyyppi: ', req.method)
    logger.info('Polku: ', req.path)
    logger.info('Runko: ', req.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Tuntematon polku.'})
}

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'Id on väärän muotoinen.'})
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}