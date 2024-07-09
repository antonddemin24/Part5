import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'


const Notification = ({ message, type }) => {
  const notificationStyle = {
    color: type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px',
  }

  if (message === null) {
    return null
  }

  return <div style={notificationStyle}>{message}</div>
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)

      // Fetch blogs after the user has logged in
      const fetchBlogs = async () => {
        try {
          const fetchedBlogs = await blogService.getAll()
          setBlogs(fetchedBlogs)
        } catch (error) {
          // Handle error
          console.error('Error fetching blogs:', error)
          setNotification({ message: 'Error fetching blogs', type: 'error' })
        }
      }
      fetchBlogs()
    }
  }, [])


  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      const fetchedBlogs = await blogService.getAll()
      setBlogs(fetchedBlogs)
    } catch (exception) {
      setNotification({ message: 'Wrong credentials', type: 'error' })
      setTimeout(() => {
        setNotification({ message: null, type: null })
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    blogService.setToken(null)
    setNotification({ message: 'Logged out successfully', type: 'success' })
    setTimeout(() => {
      setNotification({ message: null, type: null })
    }, 5000)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      const fetchedBlogs = await blogService.getAll()
      setBlogs(fetchedBlogs)
      blogFormRef.current.toggleVisibility()
      setNotification({
        message: `Added new blog: ${returnedBlog.title} by ${returnedBlog.author}`,
        type: 'success',
      })
      setTimeout(() => {
        setNotification({ message: null, type: null })
      }, 5000)
    } catch (error) {
      setNotification({ message: 'Failed to add blog', type: 'error' })
      setTimeout(() => {
        setNotification({ message: null, type: null })
      }, 5000)
    }
  }

  const updateBlog = (id, updatedBlog) => {
    setBlogs(blogs.map(blog => blog.id === id ? updatedBlog : blog))
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        Username
        <input type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        Password
        <input type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)


  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={notification.message} type={notification.type} />
      {user === null ? (
        <div>
          <h2>Log in to application</h2>
          {loginForm()}
        </div>
      ) : (
        <div>
          <p>
            Welcome, {user.name}!{' '}
            <button onClick={handleLogout}>Logout</button>
          </p>
          <Togglable buttonLabel="New Blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
          <div className='blog-list'>
            {sortedBlogs.map((blog) => (
              <Blog key={blog.id} blog={blog} user={user} setBlogs={setBlogs} blogs={blogs} updateBlog={updateBlog}/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App