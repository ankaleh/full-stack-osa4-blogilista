const app = require('./app')
const http = require('http')

//työkalut:
const logger = require('./utils/logger')
const config = require('./utils/config')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Palvelin on käynnissä portissa ${config.PORT}`)
})