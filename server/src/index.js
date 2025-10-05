const express = require('express')
const cors = require('cors')
const fs = require('fs/promises')
const path = require('path')

const PORT = process.env.PORT || 4876
const DATA_DIR = path.join(__dirname, '..', 'data', 'books')

const JSON_LIMIT = process.env.JSON_BODY_LIMIT || '150mb'

const app = express()
app.use(cors())
app.use(express.json({ limit: JSON_LIMIT }))

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

app.get('/books', async (req, res) => {
  try {
    await ensureDataDir()
    const files = await fs.readdir(DATA_DIR)
    const books = []

    for (const file of files) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(DATA_DIR, file)
      try {
        const book = await readBookFile(filePath)
        books.push({
          id: book.id,
          title: book.title || 'Untitled',
          updatedAt: book.updatedAt,
          createdAt: book.createdAt,
        })
      } catch (err) {
        console.error(`Failed to parse book file ${file}:`, err)
      }
    }

    books.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    res.json({ books })
  } catch (error) {
    console.error('[GET /books] error:', error)
    res.status(500).json({ error: 'Failed to list books' })
  }
})

app.get('/books/:id', async (req, res) => {
  try {
    await ensureDataDir()
    const filePath = getBookPath(req.params.id)
    const stat = await fs.stat(filePath).catch(() => null)
    if (!stat) {
      return res.status(404).json({ error: 'Book not found' })
    }

    const book = await readBookFile(filePath)
    res.json({ book })
  } catch (error) {
    console.error(`[GET /books/${req.params.id}] error:`, error)
    res.status(500).json({ error: 'Failed to load book' })
  }
})

app.post('/books', async (req, res) => {
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

    const existing = await fs.stat(filePath).catch(() => null)
    if (existing) {
      try {
        const current = await readBookFile(filePath)
        createdAt = current.createdAt || now
      } catch (err) {
        console.warn('Failed to read existing book for createdAt preservation:', err)
      }
    }

    const payload = {
      id,
      title: title || 'Untitled',
      data,
      metadata: metadata || {},
      createdAt,
      updatedAt: now,
    }

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')

    res.status(201).json({ book: payload })
  } catch (error) {
    console.error('[POST /books] error:', error)
    res.status(500).json({ error: 'Failed to save book' })
  }
})

app.delete('/books/:id', async (req, res) => {
  try {
    await ensureDataDir()
    const filePath = getBookPath(req.params.id)
    const stat = await fs.stat(filePath).catch(() => null)
    if (!stat) {
      return res.status(404).json({ error: 'Book not found' })
    }

    await fs.rm(filePath)
    res.json({ success: true })
  } catch (error) {
    console.error(`[DELETE /books/${req.params.id}] error:`, error)
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

ensureDataDir()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`📚 Ziner backend listening on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize data directory', error)
    process.exit(1)
  })
