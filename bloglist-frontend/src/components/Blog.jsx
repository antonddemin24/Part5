import React, { useState } from 'react'
import blogService from '../services/blogs'
import PropTypes from 'prop-types'

const Blog = ({ blog, user, setBlogs, blogs, updateBlog }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible)
  }

  const handleLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }
    await blogService.update(blog.id, updatedBlog)
    updateBlog(blog.id, updatedBlog)
  }

  const handleDelete = async () => {
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
      } catch (exception) {
        console.error('Error deleting blog:', exception)
      }
    }
  }

  return (
    <div style={blogStyle} className="blog">
      <div className='blog-title'>
        {blog.title} {blog.author} <button onClick={toggleDetails}>{detailsVisible ? 'hide' : 'view'}</button>
      </div>
      {detailsVisible && (
        <div className="blog-details">
          <div className="blog-url">{blog.url}</div>
          <div className="blog-likes">
            {blog.likes} likes <button onClick={handleLike}>like</button>
          </div>
          <div>added by {blog.user?.name || 'Unknown'}</div>
          {user && blog.user && blog.user.username === user.username && (
            <button onClick={handleDelete}>remove</button>
          )}
        </div>
      )}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }),
  setBlogs: PropTypes.func.isRequired,
  blogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default Blog