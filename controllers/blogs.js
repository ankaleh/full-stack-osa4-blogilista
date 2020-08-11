/* eslint-disable no-undef */
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/* const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
} */

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { kayttajatunnus: 1, nimi: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
  /* Blog
    .find({})
    .then(blogs => {
      response.json(blogs)})
 */
})

blogsRouter.post('/', async (request, response) => {

  const body = request.body

  //const token = getTokenFrom(request) //-> request.token olisi nyt pelkkä token
  const decodedToken = jwt.verify(request.token, process.env.SECRET) //Varmistetaan metodilla verify tokenin oikeellisuus ja dekoodataan se. Olion decodedToken sisällä nyt kirjautuneen käyttäjän kayttajatunnus ja id.
  /* if (request.token === null || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } */
  const user = await User.findById(decodedToken.id) //etsitään käyttäjä tietokannasta
  //const user = await User.findById(body.userId)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogit = await user.blogit.concat(savedBlog._id) //Tässä blogin lisääjän (user) kenttään blogit lisätään juuri luodun blogin id.
  await user.save()
  response.status(201).json(savedBlog.toJSON())

})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id) //etsitään poistettava blogi, jonka id annetaan pyynnön parametrissa id
  //await Blog.findByIdAndRemove(request.params.id)
  // eslint-disable-next-line no-undef
  const decodedToken = jwt.verify(request.token, process.env.SECRET)//Varmistetaan metodilla verify tokenin oikeellisuus ja dekoodataan se. Olion decodedToken sisällä nyt kirjautuneen käyttäjän kayttajatunnus ja id.
  /* if (request.token === null || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } */

  const user = await User.findById(decodedToken.id) //etsitään käyttäjä

  if (blog.user.toString() !== user._id.toString()) {//blogin kentässä user oleva object-tyyppinen id muutetaan merkkijonoksi ja vertaillaan toimenpiteen tekijän eli userin id:hen
    return response.status(401).json({ error: 'ei oikeutta poistaa blogia' })
  }

  const deletedBlog = await Blog.findById(request.params.id)
  await Blog.findByIdAndRemove(request.params.id)
  console.log('Poistetun blogin id: ', deletedBlog._id.toString())

  //poistetaan blogi myös lisääjän blogeista:
  const deletedBlogIndex = await user.blogit.indexOf(deletedBlog)
  await user.blogit.splice(deletedBlogIndex, 1)
  await user.save()

  response.status(204).end() //end tarkoittaa, että vastauksen mukana ei lähetetä dataa, 204 = 'No Content'
})

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog =
  await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
  res.json(updatedBlog.toJSON)

})

module.exports = blogsRouter