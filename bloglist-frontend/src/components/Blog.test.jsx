import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { describe, it, expect, vi } from 'vitest'
vi.mock('../services/blogs')
vi.mock('../App.jsx')

describe('Blog component', () => {
  const blog = {
    id: '123',
    title: 'Testing React components',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 0,
    user: {
      username: 'testuser',
      name: 'Test User'
    }
  }

  const user = {
    username: 'testuser'
  }

  it('renders title and author but not URL or number of likes by default', () => {
    const { getByText, queryByText } = render(
      <Blog blog={blog} user={user} updateBlog={() => {}} setBlogs={() => {}} blogs={[]} />
    )

    // Check that the blog's title and author are rendered
    expect(getByText((content, element) =>
      element.tagName.toLowerCase() === 'div' && content.includes('Testing React components')
    )).toBeInTheDocument()

    expect(getByText((content, element) =>
      element.tagName.toLowerCase() === 'div' && content.includes('Test Author')
    )).toBeInTheDocument()

    // Check that the blog's URL and likes are not rendered by default
    expect(queryByText('http://test.com')).not.toBeInTheDocument()
    expect(queryByText('0 likes')).not.toBeInTheDocument()
  })
  it('shows URL and number of likes when the \'view\' button is clicked', () => {
    const { getByText, queryByText } = render(
      <Blog blog={blog} user={user} updateBlog={() => {}} setBlogs={() => {}} blogs={[]} />
    )

    const button = getByText('view')
    fireEvent.click(button)

    // Check that the blog's URL and likes are rendered after clicking the button
    expect(getByText('http://test.com')).toBeInTheDocument()
    expect(getByText('0 likes')).toBeInTheDocument()
  })

  it('calls event handler twice when like button is clicked twice', async () => {
    const updateBlog = vi.fn()
    const user2 = userEvent.setup()

    const { getByText, queryByText } = render(
      <Blog key={blog.id} blog={blog} user={user} updateBlog={updateBlog} setBlogs={() => {}} blogs={[]} />
    )
    const viewButton = getByText('view')
    await user2.click(viewButton)

    const likeButton = getByText('like')

    await user2.click(likeButton)
    await user2.click(likeButton)

    expect(updateBlog).toHaveBeenCalledTimes(2)

  })
})