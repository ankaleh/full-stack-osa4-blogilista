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

module.exports = {
  dummy,
  totalLikes
}