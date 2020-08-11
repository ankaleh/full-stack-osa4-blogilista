/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7 },
  { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5 },
  { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 12 },
  { title: 'First class tests', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', likes: 10 },
  { title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0 },
  { title: 'Type wars', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', likes: 2 }
]

/* const initialUsers = [
  { kayttajatunnus: 'mummo', nimi: 'Mummo Ankka', salasanaHash: 'mummis' },
  { kayttajatunnus: 'hessu', nimi: 'Hessu Hopo', salasanaHash: 'hessuhoo' },
  { kayttajatunnus: 'mikki', nimi: 'Mikki Hiiri', salasanaHash: 'miksu' }
] */

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()

  let passwordHash = await bcrypt.hash('hessuhoo', 10)
  let userObject = new User({ kayttajatunnus: 'hessu', nimi: 'Hessu Hopo', salasanaHash: passwordHash })
  await userObject.save()

  passwordHash = await bcrypt.hash('mummis', 10)
  userObject = new User({ kayttajatunnus: 'mummo', nimi: 'Mummo Ankka', salasanaHash: passwordHash })
  await userObject.save()

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs are calculated right', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(2)
})

test('blog identifier is named id', async () => {
  const response = await api.get('/api/blogs')

  /* toimii:
  const authors = response.body.map(r => r.author)
  console.log('blogaajat: ', authors)
  expect(authors).toHaveLength(2) */

  /* const id_s = response.body.map(r => r.id)
  const id = id_s[0]
  expect(id).toBeDefined() */

  expect(response.body.map(r => r.id)).toBeDefined()
})

test('a new blog can be added', async () => {
  const newBlog = { title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0 }
  let blogsInDb = await Blog.find({})
  const blogsAtBeginning = await blogsInDb.map(blog => blog.toJSON())

  const loggingIn = { kayttajatunnus: 'hessu', salasanaHash: 'hessuhoo' }
  const loggedIn = await api
    .post('/api/login')
    .send(loggingIn)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const authorization = loggedIn.body.token
  console.log('Token on ', authorization)

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${authorization}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  blogsInDb = await Blog.find({})
  const blogsAtEnd = await blogsInDb.map(blog => blog.toJSON())
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length + 1)

})

test('undefined likes is to be zero', async () => {
  const newBlog = { title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html' }

  const loggingIn = { kayttajatunnus: 'hessu', salasanaHash: 'hessuhoo' }
  const loggedIn = await api
    .post('/api/login')
    .send(loggingIn)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const authorization = loggedIn.body.token
  console.log('Token on ', authorization)

  const addedBlog =
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${authorization}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

  expect(addedBlog.body.likes).toBe(0)
})

test('undefined title and url is to be answered by code 400', async () => {
  const newBlog = { _id: '5a422b891b54a676234d17fa', author: 'Robert C. Martin', likes: 10 }

  const loggingIn = { kayttajatunnus: 'hessu', salasanaHash: 'hessuhoo' }
  const loggedIn = await api
    .post('/api/login')
    .send(loggingIn)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const authorization = loggedIn.body.token
  console.log('Token on ', authorization)

  const addedBlog =
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${authorization}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

  let blogsInDb = await Blog.find({})

  const blogsAtEnd = await blogsInDb.map(blog => blog.toJSON())

  expect(blogsAtEnd).toHaveLength(2)
})

test('it is not possible to add a blog, if the request does not have a token, and statuscode unauthorized will be returned', async () => {
  const newBlog = { title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html' }

  const loggingIn = { kayttajatunnus: 'hessu', salasanaHash: 'hessuhoo' }
  const loggedIn = await api
    .post('/api/login')
    .send(loggingIn)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  const authorization = loggedIn.body.token
  console.log('Token on ', authorization)

  const addedBlog =
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

  let blogsInDb = await Blog.find({})

  const blogsAtEnd = await blogsInDb.map(blog => blog.toJSON())

  expect(blogsAtEnd).toHaveLength(2)
})


describe('virheellisiä käyttäjiä ei luoda', () => {

  test('liian lyhyttä salasanaa ei luoda', async () => {
    let usersInDb = await User.find({})
    const usersAtBeginning = await usersInDb.map(u => u.toJSON())

    let newUser = { kayttajatunnus: 'mikki', nimi: 'Mikki Hiiri', salasanaHash: 'mi' }
    const registeringUser =
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    usersInDb = await User.find({})
    const usersAtEnd = await usersInDb.map(u => u.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtBeginning.length)
  })

  test('käyttäjää ilman salasanaa ei luoda', async () => {
    let usersInDb = await User.find({})
    const usersAtBeginning = await usersInDb.map(u => u.toJSON())

    let newUser = { kayttajatunnus: 'mikki', nimi: 'Mikki Hiiri' }
    const registeringUser =
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    usersInDb = await User.find({})
    const usersAtEnd = await usersInDb.map(u => u.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtBeginning.length)
  })

  test('liian lyhyttä käyttäjätunnusta ei luoda', async () => {
    let usersInDb = await User.find({})
    const usersAtBeginning = await usersInDb.map(u => u.toJSON())

    let newUser = { kayttajatunnus: 'mi', nimi: 'Mikki Hiiri', salasanaHash: 'miksu' }
    const registeringUser =
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    usersInDb = await User.find({})
    const usersAtEnd = await usersInDb.map(u => u.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtBeginning.length)
  })

  test('käyttäjätunnuksen on oltava uniikki', async () => {
    let usersInDb = await User.find({})
    const usersAtBeginning = await usersInDb.map(u => u.toJSON())

    let newUser = { kayttajatunnus: 'hessu', nimi: 'Mikki Hiiri', salasanaHash: 'miksu' }
    const registeringUser =
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    usersInDb = await User.find({})
    const usersAtEnd = await usersInDb.map(u => u.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtBeginning.length)
  })

  test('käyttäjää ilman käyttäjätunnusta ei luoda', async () => {
    let usersInDb = await User.find({})
    const usersAtBeginning = await usersInDb.map(u => u.toJSON())

    let newUser = { nimi: 'Mikki Hiiri', salasanaHash: 'miksu' }
    const registeringUser =
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    usersInDb = await User.find({})
    const usersAtEnd = await usersInDb.map(u => u.toJSON())
    expect(usersAtEnd).toHaveLength(usersAtBeginning.length)
  })

})

afterAll(() => {
  mongoose.connection.close()
})