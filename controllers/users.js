const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (req, res) => {
  const body = req.body

  if (body.salasanaHash === undefined || body.salasanaHash.length < 3) {
    return res.status(400).json({ virhe: 'Salasanan on oltava vähintään kolme merkkiä pitkä.' })
  }

  const saltRounds = 10
  const salasanaHash = await bcrypt.hash(body.salasanaHash, saltRounds)

  const user = new User({
    kayttajatunnus: body.kayttajatunnus,
    nimi: body.nimi,
    salasanaHash,
  })

  const tallennettuKayttaja = await user.save()

  res.json(tallennettuKayttaja)
})

userRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogit', { url: 1, title: 1, author: 1 })
  res.json(users.map(u => u.toJSON()))
})

module.exports = userRouter