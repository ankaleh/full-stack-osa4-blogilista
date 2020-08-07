const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')

//työkalut:
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

//kontrolleri:
const blogsRouter = require('./controllers/blogs')

//tietokanta:
const mongoose = require('mongoose')
const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(() => {
    logger.info('Yhditetty MOngoDB:hen.')
  })
  .catch((error) => {
    logger.error('Virhe yhdistettäessä MongoDB:hen: ', error.message)
  })

//middlewaret käyttöön (suoritetaan järjestyksessä, jossa ne annetaan):
app.use(cors())
app.use(express.json()) //Expressin json-parseri ottaa pyynnön mukana tulevan datan (JSON), muuttaa sen JS-olioksi ja sijoittaa request-olion kenttään body ennen kuin Routeria kutsutaan.

app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
