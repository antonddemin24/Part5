const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // Reset the database
    await request.post('http://localhost:3003/api/testing/reset')

    // Create a test user
    const user = {
      username: 'testuser',
      name: 'Test User',
      password: 'password'
    }

    await request.post('http://localhost:3003/api/users', {
      data: user,
    })

    // Navigate to the app
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const usernameInput = await page.$('input[name="Username"]')
    const passwordInput = await page.$('input[name="Password"]')
    const loginButton = await page.$('button[type="submit"]')

    expect(usernameInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(loginButton).toBeTruthy()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', 'root')
      await page.fill('input[name="Password"]', 'salainen')
      await page.click('button[type="submit"]')

      const welcomeMessage = await page.textContent('text=Welcome, Superuser!')
      expect(welcomeMessage).toContain('Welcome, Superuser!')
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.fill('input[name="Username"]', 'root')
      await page.fill('input[name="Password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      const errorMessage = await page.textContent('text=Wrong credentials')
      expect(errorMessage).toContain('Wrong credentials')
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // Log in the user
      await page.fill('input[name="Username"]', 'root')
      await page.fill('input[name="Password"]', 'salainen')
      await page.click('button[type="submit"]')

    })

    test('a new blog can be created', async ({ page }) => {
      await page.click('button:text("New Blog")')
      await page.getByTestId('title').fill('Test Blog Title')
      await page.getByTestId('author').fill('Test Blog Author')
      await page.getByTestId('url').fill('http://testblogurl.com')
      await page.click('button[type="submit"]:text("create")')
      await page.waitForTimeout(1000)

      const blogList = await page.textContent('.blog-list')
      expect(blogList).toContain('Test Blog Title')
      expect(blogList).toContain('Test Blog Author')
    })

    test('a blog can be liked', async ({ page }) => {
      // View the blog details
      await page.click(`text=Test Blog Title >> button:text("view")`)

      // Like the blog
      await page.click('button:text("like")')

      // Verify the like count has incremented
      const likesText = await page.textContent('text=1 likes')
      expect(likesText).toContain('1 likes')
    })

    test('the user who added the blog can delete it', async ({ page }) => {
      // Find the blog with specific title
      // const blogTitle = 'Test Blog Title'
      // test.setTimeout(6000)
      await page.click(`text=Test Blog Title >> button:text("view")`)

      // Listen for the confirm dialog and accept it
      page.on('dialog', async dialog => await dialog.accept())

      // Click the delete button
      await page.click(`button:text("remove")`, { timeout: 600000 })

      await page.waitForTimeout(1000)
      // Verify the blog is no longer in the list
      const blogList = await page.textContent('.blog-list')
      // await page.waitForTimeout(3000)
      expect(blogList).not.toContain('Test Blog Title')
    })
  })

  describe('Blog app', () => {
    beforeEach(async ({ page, context }) => {
      // Clear localStorage to ensure a clean state for each test
      // await context.clearLocalStorage()
      // Navigate to the application
      await page.goto('http://localhost:5173')
    })
  
    test('delete button is visible only to the user who added the blog', async ({ page }) => {
      // Log in as user A and create a blog
      await login(page, 'root', 'salainen')
      const blogA = await createBlog(page, 'Test Blog A', 'Author A', 'http://bloga.com')
      await page.click(`text=Test Blog A >> button:text("view")`)
      await page.waitForTimeout(1000)
  
      // Verify that user A can see the delete button
      const deleteButtonVisibleA = await page.isVisible(`button:text("remove")`)
      expect(deleteButtonVisibleA).toBeTruthy()
  
      // Log out and then log in as user B
      await logout(page)
      await login(page, 'testuser', 'password')
      const blogB = await createBlog(page, 'Test Blog B', 'Author B', 'http://blogb.com')
      await page.click(`text=Test Blog A >> button:text("view")`)
  
      // Verify that user B cannot see the delete button for blog A
      const deleteButtonVisibleBForA = await page.isVisible(`button:text("remove")`)
      expect(deleteButtonVisibleBForA).toBeFalsy()

      await page.click(`text=Test Blog B >> button:text("view")`)
  
      // Verify that user B can see the delete button for blog B
      const deleteButtonVisibleBForB = await page.isVisible(`button:text("remove")`)
      expect(deleteButtonVisibleBForB).toBeTruthy()
      await logout(page)
    })
  })
  
  // Helper functions to encapsulate login, logout, and create blog functionalities
  async function login(page, username, password) {
    await page.fill('input[name="Username"]', username)
    await page.fill('input[name="Password"]', password)
    await page.click('button[type="submit"]')
  }
  
  async function logout(page) {
    await page.click('button >> text="Logout"')
  }
  
  async function createBlog(page, title, author, url) {
    await page.click('button >> text="New Blog"')
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill(author)
    await page.getByTestId('url').fill(url)
    await page.click('button[type="submit"]:text("create")')
    return { title, author } // Return blog details for verification
  }

  describe('Blog app', () => {
    beforeEach(async ({ page, context }) => {
      // Clear localStorage to ensure a clean state for each test
      // await context.clearLocalStorage();
      // Navigate to the application
      await page.goto('http://localhost:5173');
    });
  
    test('blogs are ordered by likes (most likes first)', async ({ page }) => {
      // Log in as a user
      await login(page, 'root', 'salainen');
  
      // Create blogs with different numbers of likes
      const blogData = [
        { title: 'Blog A', author: 'Author A', url: 'http://bloga.com', likes: 5 },
        { title: 'Blog B', author: 'Author B', url: 'http://blogb.com', likes: 10 },
        { title: 'Blog C', author: 'Author C', url: 'http://blogc.com', likes: 3 },
        { title: 'Blog D', author: 'Author D', url: 'http://blogd.com', likes: 8 },
      ];
  
      for (const data of blogData) {
        await createBlog(page, data.title, data.author, data.url);
        await page.click(`.blog-list >> text=${data.title} >> button:text("view")`)
        // Simulate liking the blog the specified number of times
        for (let i = 0; i < data.likes; i++) {
          await page.click(`button:text("like")`)
          await page.waitForTimeout(100)
        }
        await page.click(`text=${data.title} >> button:text("hide")`)
      }
  
      // Fetch blogs and verify their order based on likes
      const blogs = await fetchBlogs(page);
      const sortedBlogs = blogData.sort((a, b) => b.likes - a.likes);
      console.log(blogs)
  
      for (let i = 0; i < sortedBlogs.length; i++) {
        expect(blogs[i].title).toContain(`${sortedBlogs[i].title} ${sortedBlogs[i].author} view`)
      }
    })
  })
    
  async function fetchBlogs(page) {
    const blogs = await page.$$eval(`.blog`, blogs => {
      return blogs.map(blog => {
        return {
          title: blog.querySelector('.blog-title').textContent.trim(),
        }
      })
    })
    return blogs
  }
})