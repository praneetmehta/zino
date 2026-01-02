const express = require('express')
const router = express.Router()
const fs = require('fs/promises')
const path = require('path')
const { authenticateJWT } = require('../middleware/auth')

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Apply authentication and admin check to all routes
router.use(authenticateJWT, requireAdmin)

const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data')
const BOOKS_DIR = path.join(VOLUME_PATH, 'books')
const UPLOADS_DIR = path.join(VOLUME_PATH, 'uploads')
const TEMPLATES_DIR = path.join(VOLUME_PATH, 'templates', 'books')
const ORDERS_DIR = path.join(VOLUME_PATH, 'orders')

// Helper to get directory size
async function getDirectorySize(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    let totalSize = 0
    
    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      if (file.isDirectory()) {
        totalSize += await getDirectorySize(filePath)
      } else {
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }
    }
    
    return totalSize
  } catch (error) {
    return 0
  }
}

// Helper to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res) => {
  try {
    // Get book statistics
    const bookFiles = await fs.readdir(BOOKS_DIR).catch(() => [])
    const books = []
    for (const file of bookFiles) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(BOOKS_DIR, file), 'utf-8')
        const book = JSON.parse(data)
        books.push(book)
      }
    }

    // Get template statistics
    const templateFiles = await fs.readdir(TEMPLATES_DIR).catch(() => [])
    const templates = []
    for (const file of templateFiles) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(TEMPLATES_DIR, file), 'utf-8')
        const template = JSON.parse(data)
        templates.push(template)
      }
    }

    // Get upload statistics
    const uploadFiles = await fs.readdir(UPLOADS_DIR).catch(() => [])
    const uploads = uploadFiles.filter(f => !f.startsWith('.'))

    // Get order statistics (if orders directory exists)
    let orders = []
    try {
      const orderFiles = await fs.readdir(ORDERS_DIR)
      for (const file of orderFiles) {
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(ORDERS_DIR, file), 'utf-8')
          orders.push(JSON.parse(data))
        }
      }
    } catch (error) {
      // Orders directory doesn't exist yet
    }

    // Calculate storage usage
    const booksSize = await getDirectorySize(BOOKS_DIR)
    const uploadsSize = await getDirectorySize(UPLOADS_DIR)
    const templatesSize = await getDirectorySize(TEMPLATES_DIR)
    const totalSize = booksSize + uploadsSize + templatesSize

    // User statistics (from books)
    const userIds = new Set(books.map(b => b.userId).filter(Boolean))
    
    // Books by date
    const booksByDate = books.reduce((acc, book) => {
      const date = new Date(book.createdAt).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Template usage
    const templateUsage = templates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      downloads: t.downloads || 0,
      createdAt: t.metadata?.createdAt
    }))

    res.json({
      overview: {
        totalBooks: books.length,
        totalTemplates: templates.length,
        totalUploads: uploads.length,
        totalOrders: orders.length,
        totalUsers: userIds.size,
        storageUsed: formatBytes(totalSize),
        storageBytes: totalSize
      },
      storage: {
        books: formatBytes(booksSize),
        uploads: formatBytes(uploadsSize),
        templates: formatBytes(templatesSize),
        total: formatBytes(totalSize)
      },
      booksByDate,
      templateUsage,
      recentBooks: books
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(b => ({
          id: b.id,
          title: b.title,
          userId: b.userId,
          createdAt: b.createdAt,
          pageCount: b.metadata?.pageCount || 0
        })),
      recentOrders: orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// GET /api/admin/books - Get all books with details
router.get('/books', async (req, res) => {
  try {
    const files = await fs.readdir(BOOKS_DIR)
    const books = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(BOOKS_DIR, file)
        const stats = await fs.stat(filePath)
        const data = await fs.readFile(filePath, 'utf-8')
        const book = JSON.parse(data)
        
        books.push({
          ...book,
          fileSize: formatBytes(stats.size),
          fileSizeBytes: stats.size,
          lastModified: stats.mtime
        })
      }
    }
    
    // Sort by creation date, newest first
    books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json({ books })
  } catch (error) {
    console.error('Error fetching books:', error)
    res.status(500).json({ error: 'Failed to fetch books' })
  }
})

// DELETE /api/admin/books/:id - Delete a book
router.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(BOOKS_DIR, `${id}.json`)
    
    await fs.unlink(filePath)
    console.log(`🗑️ Admin deleted book: ${id}`)
    
    res.json({ success: true, message: 'Book deleted' })
  } catch (error) {
    console.error('Error deleting book:', error)
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

// GET /api/admin/templates - Get all templates with details
router.get('/templates', async (req, res) => {
  try {
    const files = await fs.readdir(TEMPLATES_DIR)
    const templates = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(TEMPLATES_DIR, file)
        const stats = await fs.stat(filePath)
        const data = await fs.readFile(filePath, 'utf-8')
        const template = JSON.parse(data)
        
        templates.push({
          ...template,
          fileSize: formatBytes(stats.size),
          fileSizeBytes: stats.size,
          lastModified: stats.mtime
        })
      }
    }
    
    templates.sort((a, b) => new Date(b.metadata?.createdAt || 0) - new Date(a.metadata?.createdAt || 0))
    
    res.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// DELETE /api/admin/templates/:id - Delete a template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(TEMPLATES_DIR, `${id}.json`)
    
    await fs.unlink(filePath)
    console.log(`🗑️ Admin deleted template: ${id}`)
    
    res.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
})

// GET /api/admin/uploads - Get all uploaded files
router.get('/uploads', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOADS_DIR)
    const uploads = []
    
    for (const file of files) {
      if (!file.startsWith('.')) {
        const filePath = path.join(UPLOADS_DIR, file)
        const stats = await fs.stat(filePath)
        
        uploads.push({
          name: file,
          size: formatBytes(stats.size),
          sizeBytes: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        })
      }
    }
    
    uploads.sort((a, b) => new Date(b.created) - new Date(a.created))
    
    res.json({ uploads, total: uploads.length })
  } catch (error) {
    console.error('Error fetching uploads:', error)
    res.status(500).json({ error: 'Failed to fetch uploads' })
  }
})

// DELETE /api/admin/uploads/:filename - Delete an uploaded file
router.delete('/uploads/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(UPLOADS_DIR, filename)
    
    await fs.unlink(filePath)
    console.log(`🗑️ Admin deleted upload: ${filename}`)
    
    res.json({ success: true, message: 'File deleted' })
  } catch (error) {
    console.error('Error deleting upload:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

// GET /api/admin/system - Get system information
router.get('/system', async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: {
        total: formatBytes(process.memoryUsage().heapTotal),
        used: formatBytes(process.memoryUsage().heapUsed),
        rss: formatBytes(process.memoryUsage().rss)
      },
      env: process.env.NODE_ENV || 'development',
      volumePath: VOLUME_PATH
    }
    
    res.json(systemInfo)
  } catch (error) {
    console.error('Error fetching system info:', error)
    res.status(500).json({ error: 'Failed to fetch system info' })
  }
})

module.exports = router
