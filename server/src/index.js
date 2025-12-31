// Load environment variables first
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const fs = require('fs/promises')
const path = require('path')

// Import middleware and routes
const { authenticateJWT, optionalAuth } = require('../middleware/auth')
const authRoutes = require('../routes/auth')
const imageRoutes = require('../routes/images')
const { storageService } = require('../services/storage')
const { databaseService } = require('../services/database')
const { googleAuthService } = require('../services/auth/googleAuth')

const PORT = process.env.PORT || 4876

// Use Railway volume path if available, otherwise local data directory
const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data')
const DATA_DIR = path.join(VOLUME_PATH, 'books')
const LAYOUTS_DIR = path.join(VOLUME_PATH, 'customLayouts')

console.log(`📁 Data directory: ${DATA_DIR}`)
console.log(`📁 Layouts directory: ${LAYOUTS_DIR}`)

const JSON_LIMIT = process.env.JSON_BODY_LIMIT || '150mb'

// CORS Configuration
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000', 'http://localhost:3001']

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    
    // In development, allow all
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ CORS allowed (dev mode): ${origin}`)
      return callback(null, true)
    }
    
    // In production, check whitelist
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      console.log(`✅ CORS allowed: ${origin}`)
      callback(null, true)
    } else {
      console.warn(`❌ CORS blocked: ${origin}`)
      console.warn(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`)
      console.warn(`   Tip: Set NODE_ENV=development for dev mode`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}

const app = express()
app.use(cors(corsOptions))
app.use(express.json({ limit: JSON_LIMIT }))

// Initialize services
async function initializeServices() {
  // Initialize storage service
  storageService.init(process.env.STORAGE_PROVIDER)

  // Initialize database
  try {
    await databaseService.init()
  } catch (error) {
    console.warn('⚠️  Database initialization failed, continuing without database')
  }

  // Initialize Google OAuth
  googleAuthService.init()
}

// Static file serving for uploads (filesystem storage)
const UPLOADS_PATH = path.join(VOLUME_PATH, 'uploads')
console.log(`📁 Uploads directory: ${UPLOADS_PATH}`)
app.use('/uploads', express.static(UPLOADS_PATH))

// Auth routes (no auth required for these)
app.use('/auth', authRoutes)

// Image upload routes
app.use('/api/images', imageRoutes)

// Serve frontend static files from /zino path
const FRONTEND_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist')
app.use('/zino', express.static(FRONTEND_DIST, {
  // Don't serve index.html for assets
  index: false
}))

// Fallback: serve index.html for SPA routes
// Use regex to exclude asset paths
app.get(/^\/zino\/(?!assets\/|favicon|.*\.(ico|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'))
})

async function ensureLayoutsDir() {
  await fs.mkdir(LAYOUTS_DIR, { recursive: true })
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

function getBookPath(bookId) {
  const safeId = String(bookId).trim()
  if (!safeId) {
    throw new Error('Book id is required')
  }
  return path.join(DATA_DIR, `${safeId}.json`)
}

async function readBookFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/books', optionalAuth, async (req, res) => {
  try {
    await ensureDataDir()
    const files = await fs.readdir(DATA_DIR)
    const books = []

    // Get userId from authenticated user (JWT token), NOT from query params
    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(DATA_DIR, file)
      try {
        const book = await readBookFile(filePath)
        
        // Authorization logic:
        // - No auth (dev mode): return all books
        // - Regular user: return only their own books
        // - Admin: return all books
        if (currentUserId && book.userId) {
          const isOwner = book.userId === currentUserId
          
          if (!isAdmin && !isOwner) {
            continue // Skip books that don't belong to user (unless admin)
          }
        }
        
        books.push({
          id: book.id,
          title: book.title || 'Untitled',
          updatedAt: book.updatedAt,
          createdAt: book.createdAt,
          userId: book.userId,
        })
      } catch (err) {
        console.error(`Failed to parse book file ${file}:`, err)
      }
    }

    books.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    res.json(books)
  } catch (error) {
    console.error('[GET /books] error:', error)
    res.status(500).json({ error: 'Failed to list books' })
  }
})

app.get('/books/:id', optionalAuth, async (req, res) => {
  try {
    await ensureDataDir()
    const filePath = getBookPath(req.params.id)
    const stat = await fs.stat(filePath).catch(() => null)
    if (!stat) {
      return res.status(404).json({ error: 'Book not found' })
    }

    const book = await readBookFile(filePath)
    
    // Check ownership in production (skip in dev mode)
    if (req.user && book.userId && book.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    res.json(book)
  } catch (error) {
    console.error(`[GET /books/${req.params.id}] error:`, error)
    res.status(500).json({ error: 'Failed to load book' })
  }
})

app.post('/books', optionalAuth, async (req, res) => {
  try {
    await ensureDataDir()
    const { id, title, data, metadata } = req.body || {}

    if (!id) {
      return res.status(400).json({ error: 'Book id is required' })
    }
    if (!data) {
      return res.status(400).json({ error: 'Book data is required' })
    }

    const filePath = getBookPath(id)
    const now = new Date().toISOString()
    let createdAt = now
    let userId = req.user?.id || null

    const existing = await fs.stat(filePath).catch(() => null)
    if (existing) {
      try {
        const current = await readBookFile(filePath)
        createdAt = current.createdAt || now
        userId = current.userId || userId
        
        // Check ownership for updates
        if (req.user && current.userId && current.userId !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied' })
        }
      } catch (err) {
        console.warn('Failed to read existing book for createdAt preservation:', err)
      }
    }

    const payload = {
      id,
      title: title || 'Untitled',
      data,
      metadata: metadata || {},
      userId,
      createdAt,
      updatedAt: now,
    }

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')

    res.status(201).json(payload)
  } catch (error) {
    console.error('[POST /books] error:', error)
    res.status(500).json({ error: 'Failed to save book' })
  }
})

app.delete('/books/:id', optionalAuth, async (req, res) => {
  try {
    await ensureDataDir()
    const filePath = getBookPath(req.params.id)
    const stat = await fs.stat(filePath).catch(() => null)
    if (!stat) {
      return res.status(404).json({ error: 'Book not found' })
    }

    // Check ownership before deleting
    if (req.user) {
      const book = await readBookFile(filePath)
      if (book.userId && book.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    await fs.rm(filePath)
    res.json({ success: true })
  } catch (error) {
    console.error(`[DELETE /books/${req.params.id}] error:`, error)
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

// Custom Layouts API
app.get('/layouts/custom', optionalAuth, async (req, res) => {
  try {
    await ensureLayoutsDir()
    const files = await fs.readdir(LAYOUTS_DIR)
    const layouts = []
    const currentUserId = req.user?.id
    const isAdmin = req.user?.role === 'admin'

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(LAYOUTS_DIR, file)
      try {
        const raw = await fs.readFile(filePath, 'utf8')
        const layout = JSON.parse(raw)
        
        // Filter by user: show only own layouts (or all if admin)
        if (currentUserId && layout.userId) {
          const isOwner = layout.userId === currentUserId
          if (!isAdmin && !isOwner) {
            continue // Skip layouts that don't belong to user
          }
        }
        
        layouts.push(layout)
      } catch (err) {
        console.error(`Failed to parse layout file ${file}:`, err)
      }
    }

    res.json({ layouts })
  } catch (error) {
    console.error('[GET /layouts/custom] error:', error)
    res.status(500).json({ error: 'Failed to list custom layouts' })
  }
})

app.post('/layouts/custom', optionalAuth, async (req, res) => {
  try {
    await ensureLayoutsDir()
    const layout = req.body

    if (!layout.id) {
      return res.status(400).json({ error: 'Layout id is required' })
    }
    if (!layout.name) {
      return res.status(400).json({ error: 'Layout name is required' })
    }

    const now = new Date().toISOString()
    const userId = req.user?.id || null
    const username = req.user?.name || req.user?.email || 'Anonymous'
    const isAdmin = req.user?.role === 'admin'
    
    // Non-admin users can only create layouts in 'custom' category
    let category = layout.category || 'custom'
    if (!isAdmin && category !== 'custom') {
      category = 'custom'
      console.log(`Non-admin user attempted to create layout in '${layout.category}' category. Forcing to 'custom'.`)
    }
    
    // Check if updating existing layout
    const filename = `${layout.id}.json`
    const filePath = path.join(LAYOUTS_DIR, filename)
    const existing = await fs.stat(filePath).catch(() => null)
    
    let createdAt = now
    if (existing) {
      try {
        const current = JSON.parse(await fs.readFile(filePath, 'utf8'))
        createdAt = current.createdAt || now
        
        // Check ownership for updates
        if (req.user && current.userId && current.userId !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied' })
        }
      } catch (err) {
        console.warn('Failed to read existing layout:', err)
      }
    }

    const payload = {
      ...layout,
      category, // Use the enforced category
      userId,
      username,
      createdAt,
      updatedAt: now,
      enabled: layout.enabled !== undefined ? layout.enabled : true
    }

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')

    res.status(201).json({ layout: payload, message: 'Layout saved successfully' })
  } catch (error) {
    console.error('[POST /layouts/custom] error:', error)
    res.status(500).json({ error: 'Failed to save custom layout' })
  }
})

app.delete('/layouts/custom/:id', optionalAuth, async (req, res) => {
  try {
    await ensureLayoutsDir()
    const filename = `${req.params.id}.json`
    const filePath = path.join(LAYOUTS_DIR, filename)
    
    const stat = await fs.stat(filePath).catch(() => null)
    if (!stat) {
      return res.status(404).json({ error: 'Layout not found' })
    }
    
    // Check ownership
    try {
      const layout = JSON.parse(await fs.readFile(filePath, 'utf8'))
      if (req.user && layout.userId && layout.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' })
      }
    } catch (err) {
      // Continue with deletion if can't read
    }

    await fs.rm(filePath)
    res.json({ success: true })
  } catch (error) {
    console.error(`[DELETE /layouts/custom/${req.params.id}] error:`, error)
    res.status(500).json({ error: 'Failed to delete layout' })
  }
})

// Fallback: serve index.html for any /zino/* routes (SPA support)
app.get('/zino/*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'))
})

// Root path - can be used for landing page or redirect
app.get('/', (req, res) => {
  res.send('<h1>Welcome to Zino</h1><p><a href="/zino">Go to Zino App →</a></p>')
})

// Initialize server
async function startServer() {
  try {
    // Initialize directories
    await ensureDataDir()
    await ensureLayoutsDir()

    // Initialize services
    await initializeServices()

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`📚 Zino backend listening on http://0.0.0.0:${PORT}`)
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`   CORS Origins: ${ALLOWED_ORIGINS.join(', ')}`)
      console.log(`   Storage: ${process.env.STORAGE_PROVIDER || 'filesystem'}`)
      console.log(`   Database: ${databaseService.isConnected() ? '✅ Connected' : '⚠️  Not configured'}`)
      console.log(`   Google OAuth: ${googleAuthService.isConfigured() ? '✅ Configured' : '⚠️  Not configured'}`)
      console.log(`   Frontend: http://0.0.0.0:${PORT}/zino`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
