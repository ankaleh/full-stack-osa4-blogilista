const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

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

  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET) //varmistetaan metodilla verify tokenin oikeellisuus ja dekoodataan se, olion decodedToken sisällä kayttajatunnus ja id
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
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
  await Blog.findByIdAndRemove(request.params.id)
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