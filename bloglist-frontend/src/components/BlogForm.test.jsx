import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import BlogForm from './BlogForm'
import { describe, expect, vi } from 'vitest'

describe('BlogForm component', () => {
  test('calls event handler with the right details when a new blog is created', () => {
    const createBlogMock = vi.fn()

    const { container } = render(<BlogForm createBlog={createBlogMock} />)

    const titleInput = container.querySelector('#blog-title')
    const authorInput = container.querySelector('#blog-author')
    const urlInput = container.querySelector('#blog-url')
    const form = container.querySelector('form')

    fireEvent.change(titleInput, { target: { value: 'Test Blog' } })
    fireEvent.change(authorInput, { target: { value: 'Test Author' } })
    fireEvent.change(urlInput, { target: { value: 'http://test.com' } })

    fireEvent.submit(form)

    expect(createBlogMock).toHaveBeenCalledTimes(1)
    expect(createBlogMock).toHaveBeenCalledWith({
      title: 'Test Blog',
      author: 'Test Author',
      url: 'http://test.com',
    })
  })
})