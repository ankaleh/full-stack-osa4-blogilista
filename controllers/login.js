/* eslint-disable no-undef */
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ kayttajatunnus: body.kayttajatunnus })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.salasanaHash, user.salasanaHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.kayttajatunnus,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET) //luodaan token

  response
    .status(200)
    .send({ token, kayttajatunnus: user.kayttajatunnus, nimi: user.nimi })
})

module.exports = loginRouter