/* eslint-disable no-unused-vars */
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  /* const reducer = (sum, likes) => {
    return sum + likes
  }
  return blogs.reduce(reducer, 0)
} */

  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)

}

const favoriteBlog = (blogs) => {
  let likes = 0
  let foundBlog = {}
  blogs.forEach(blog => {
    if (blog.likes >= likes) {
      likes = blog.likes
      foundBlog = blog
    }
  })
  return foundBlog
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}