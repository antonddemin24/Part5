import React, { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url,
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>Create New Blog</h2>
      <form onSubmit={handleSubmit}>
        <div>
          title
          <input
            data-testid='title'
            type="text"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            id='blog-title'
          />
        </div>
        <div>
          author
          <input
            data-testid='author'
            type="text"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            id='blog-author'
          />
        </div>
        <div>
          url
          <input
            data-testid='url'
            type="text"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
            id='blog-url'
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm