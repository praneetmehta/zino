const express = require('express')
const router = express.Router()
const fs = require('fs/promises')
const path = require('path')
const { authenticateJWT, optionalAuth } = require('../middleware/auth')

// Template directories
const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data')
const BOOK_TEMPLATES_DIR = path.join(VOLUME_PATH, 'templates', 'books')
const COVER_TEMPLATES_DIR = path.join(VOLUME_PATH, 'templates', 'covers')

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(BOOK_TEMPLATES_DIR, { recursive: true })
  await fs.mkdir(COVER_TEMPLATES_DIR, { recursive: true })
}
ensureDirectories()

// GET /api/templates/books - List all book templates
router.get('/books', optionalAuth, async (req, res) => {
  try {
    const files = await fs.readdir(BOOK_TEMPLATES_DIR)
    const templates = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(BOOK_TEMPLATES_DIR, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const template = JSON.parse(data)
        
        // Return metadata only (not full book data)
        templates.push({
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnail: template.thumbnail,
          pageCount: template.pages?.length || 0,
          category: template.category || 'general',
          tags: template.tags || [],
          config: template.config
        })
      }
    }

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching book templates:', error)
    res.status(500).json({ error: 'Failed to fetch book templates' })
  }
})

// GET /api/templates/books/:id - Get specific book template
router.get('/books/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(BOOK_TEMPLATES_DIR, `${id}.json`)
    
    const data = await fs.readFile(filePath, 'utf-8')
    const template = JSON.parse(data)
    
    // If template doesn't have demo images, load default ones
    if (!template.demoImages || template.demoImages.length === 0) {
      try {
        const demoImagesPath = path.join(__dirname, '../data/demo-images.json')
        const demoImagesData = await fs.readFile(demoImagesPath, 'utf-8')
        const demoImages = JSON.parse(demoImagesData)
        template.demoImages = demoImages
      } catch (err) {
        console.warn('Could not load default demo images:', err.message)
        template.demoImages = []
      }
    }
    
    res.json({ template })
  } catch (error) {
    console.error('Error fetching book template:', error)
    res.status(404).json({ error: 'Template not found' })
  }
})

// GET /api/demo-images - Get demo images for template builder
router.get('/demo-images', optionalAuth, async (req, res) => {
  try {
    const demoImagesPath = path.join(__dirname, '../data/demo-images.json')
    const data = await fs.readFile(demoImagesPath, 'utf-8')
    const demoImages = JSON.parse(data)
    
    res.json(demoImages)
  } catch (error) {
    console.error('Error fetching demo images:', error)
    res.status(500).json({ error: 'Failed to load demo images' })
  }
})

// POST /api/templates/books/:id/clone - Clone a book template for user
router.post('/books/:id/clone', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // Read template
    const templatePath = path.join(BOOK_TEMPLATES_DIR, `${id}.json`)
    const templateData = await fs.readFile(templatePath, 'utf-8')
    const template = JSON.parse(templateData)
    
    // Create new book from template in the format expected by zineStore
    const newBook = {
      id: `book-${Date.now()}`,
      userId: userId,
      title: `${template.name} (Copy)`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        zineConfig: {
          width: template.config.width,
          height: template.config.height,
          unit: template.config.unit,
          bleed: template.config.bleed || 0,
          margin: template.config.margin || 0,
          slotInnerMarginPercent: template.config.slotInnerMarginPercent || 0,
          bindingType: template.config.bindingType || template.config.binding || 'folded'
        },
        mediaAssets: [],
        pages: template.pages.map((page, index) => ({
          id: `page-${Date.now()}-${index}`,
          layout: page.layoutId || 'custom',
          slots: (page.slots || []).map((slot, slotIndex) => ({
            id: `slot-${Date.now()}-${index}-${slotIndex}`,
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            fit: slot.fit || 'cover',
            imageId: null,
            url: null
          })),
          textElements: (page.textElements || []).map((text, textIndex) => ({
            id: text.id || `text-${Date.now()}-${index}-${textIndex}`,
            type: 'text',
            content: text.content,
            x: text.x,
            y: text.y,
            width: text.width,
            height: text.height,
            style: text.style || {}
          }))
        }))
      },
      metadata: {
        ...template.metadata,
        isFromTemplate: true,
        templateId: id,
        templateName: template.name
      }
    }
    
    // Save to user's books
    const DATA_DIR = path.join(VOLUME_PATH, 'books')
    await fs.mkdir(DATA_DIR, { recursive: true })
    const bookPath = path.join(DATA_DIR, `${newBook.id}.json`)
    await fs.writeFile(bookPath, JSON.stringify(newBook, null, 2))
    
    res.json({ 
      success: true, 
      book: newBook,
      message: 'Template cloned successfully'
    })
  } catch (error) {
    console.error('Error cloning book template:', error)
    res.status(500).json({ error: 'Failed to clone template' })
  }
})

// GET /api/templates/covers - List all cover templates
router.get('/covers', optionalAuth, async (req, res) => {
  try {
    const files = await fs.readdir(COVER_TEMPLATES_DIR)
    const templates = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(COVER_TEMPLATES_DIR, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const template = JSON.parse(data)
        
        templates.push({
          id: template.id,
          name: template.name,
        })
      }
    }

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching cover templates:', error)
    res.status(500).json({ error: 'Failed to fetch cover templates' })
  }
})

// GET /api/templates/covers/:id - Get specific cover template
router.get('/covers/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const filePath = path.join(COVER_TEMPLATES_DIR, `${id}.json`)
    
    const data = await fs.readFile(filePath, 'utf-8')
    const template = JSON.parse(data)
    
    res.json({ template })
  } catch (error) {
    console.error('Error fetching cover template:', error)
    res.status(404).json({ error: 'Template not found' })
  }
})

// POST /api/templates/covers/:id/apply - Apply cover template to a book
router.post('/covers/:id/apply', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params
    const { bookId } = req.body
    const userId = req.user.id
    
    // Read cover template
    const templatePath = path.join(COVER_TEMPLATES_DIR, `${id}.json`)
    const templateData = await fs.readFile(templatePath, 'utf-8')
    const template = JSON.parse(templateData)
    
    // Read user's book
    const DATA_DIR = path.join(VOLUME_PATH, 'books')
    const bookPath = path.join(DATA_DIR, `${bookId}.json`)
    const bookData = await fs.readFile(bookPath, 'utf-8')
    const book = JSON.parse(bookData)
    
    // Verify ownership
    if (book.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    // Apply cover template
    book.cover = {
      templateId: id,
      templateName: template.name,
      front: template.front,
      back: template.back,
      spine: template.spine,
      coverType: template.coverType
    }
    book.updatedAt = new Date().toISOString()
    
    // Save book
    await fs.writeFile(bookPath, JSON.stringify(book, null, 2))
    
    res.json({ 
      success: true, 
      book,
      message: 'Cover template applied successfully'
    })
  } catch (error) {
    console.error('Error applying cover template:', error)
    res.status(500).json({ error: 'Failed to apply cover template' })
  }
})

// Admin routes for creating templates (protected)
// POST /api/templates/books - Create book template (admin only)
router.post('/books', authenticateJWT, async (req, res) => {
  try {
    // TODO: Add admin check
    const template = req.body
    
    if (!template.id || !template.name) {
      return res.status(400).json({ error: 'Template must have id and name' })
    }
    
    const filePath = path.join(BOOK_TEMPLATES_DIR, `${template.id}.json`)
    await fs.writeFile(filePath, JSON.stringify(template, null, 2))
    
    res.json({ success: true, message: 'Book template created' })
  } catch (error) {
    console.error('Error creating book template:', error)
    res.status(500).json({ error: 'Failed to create book template' })
  }
})

// POST /api/templates/covers - Create cover template (admin only)
router.post('/covers', authenticateJWT, async (req, res) => {
  try {
    // TODO: Add admin check
    const template = req.body
    
    if (!template.id || !template.name) {
      return res.status(400).json({ error: 'Template must have id and name' })
    }
    
    const filePath = path.join(COVER_TEMPLATES_DIR, `${template.id}.json`)
    await fs.writeFile(filePath, JSON.stringify(template, null, 2))
    
    res.json({ success: true, message: 'Cover template created' })
  } catch (error) {
    console.error('Error creating cover template:', error)
    res.status(500).json({ error: 'Failed to create cover template' })
  }
})

module.exports = router
