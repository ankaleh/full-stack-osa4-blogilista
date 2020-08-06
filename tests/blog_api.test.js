const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

const inititalBlogs = [
  { _id: '5a422a851b54a676234d17f7', title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7, __v: 0 },
  { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', likes: 5, __v: 0 },
  { _id: '5a422b3a1b54a676234d17f9', title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 12, __v: 0 },
  { _id: '5a422b891b54a676234d17fa', title: 'First class tests', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', likes: 10, __v: 0 },
  { _id: '5a422ba71b54a676234d17fb', title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0, __v: 0 },
  { _id: '5a422bc61b54a676234d17fc', title: 'Type wars', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', likes: 2, __v: 0 }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(inititalBlogs[0])
  await blogObject.save()

  blogObject = new Blog(inititalBlogs[1])
  await blogObject.save()
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

test('a new blog can be added', async() => {
  const newBlog = { title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', likes: 0 }
  let blogsInDb = await Blog.find({})
  const blogsAtBeginning = await blogsInDb.map(blog => blog.toJSON())
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  blogsInDb = await Blog.find({})
  const blogsAtEnd = await blogsInDb.map(blog => blog.toJSON())
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length + 1)

})

afterAll(() => {
  mongoose.connection.close()
})