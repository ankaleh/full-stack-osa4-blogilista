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

const mostBlogs = (blogs) => {
  let author = ''
  let numberOfBlogs = 0
  blogs.forEach(blog => {
    const amount = blogs.filter(b => b.author === blog.author)
    if (amount.length >= numberOfBlogs) {
      numberOfBlogs = amount.length
      author = blog.author
    }
  })
  return { author: author, blogs: numberOfBlogs }

}

const mostLikes = (blogs) => {
  let author = ''
  let mostLikes = 0

  blogs.forEach(blog => {
    const authorsBlogs = blogs.filter(b => b.author === blog.author)
    const likes = authorsBlogs.reduce((sum, blog) => {
      return sum + blog.likes
    }, 0)
    if (likes >= mostLikes) {
      mostLikes = likes
      author = blog.author
    }
  })

  return { author: author, likes: mostLikes }

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}