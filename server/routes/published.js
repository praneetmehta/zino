/**
 * Published PDF Routes
 * Handles publishing, storing, and retrieving user-published PDFs
 * Uses abstracted storage service for Railway volumes or AWS S3
 */
const express = require('express')
const router = express.Router()
const multer = require('multer')
const { authenticateJWT } = require('../middleware/auth')
const { pdfStorageService } = require('../services/pdfStorage')

// Storage for published PDFs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})


/**
 * POST /api/published/upload
 * Publish a PDF and attach to user account
 */
router.post('/upload', authenticateJWT, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' })
    }

    const userId = req.user.id
    const { title, bookId, pageCount } = req.body

    // Publish PDF using storage service
    const publication = await pdfStorageService.publishPDF(req.file.buffer, {
      userId,
      title: title || 'Untitled Zine',
      bookId: bookId || null,
      pageCount: parseInt(pageCount) || 0,
    })

    res.status(201).json({
      success: true,
      publication: {
        id: publication.id,
        title: publication.title,
        pageCount: publication.pageCount,
        size: publication.size,
        publishedAt: publication.publishedAt,
      }
    })
  } catch (error) {
    console.error('[POST /api/published/upload] error:', error)
    res.status(500).json({ 
      error: 'Failed to publish PDF',
      message: error.message 
    })
  }
})

/**
 * GET /api/published
 * Get all published PDFs for the authenticated user
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const publications = await pdfStorageService.getUserPublications(userId)

    res.json({
      success: true,
      publications,
      count: publications.length
    })
  } catch (error) {
    console.error('[GET /api/published] error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch publications',
      message: error.message 
    })
  }
})

/**
 * GET /api/published/:id/download
 * Download a published PDF
 */
router.get('/:id/download', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const publicationId = req.params.id
    
    // Download PDF using storage service
    const download = await pdfStorageService.downloadPDF(publicationId, userId)
    
    // Sanitize filename
    const sanitizedTitle = download.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`)
    res.setHeader('Content-Length', download.size)
    
    // Pipe the stream to response
    download.stream.pipe(res)
  } catch (error) {
    console.error(`[GET /api/published/${req.params.id}/download] error:`, error)
    
    if (error.message === 'Publication not found' || error.message === 'Access denied') {
      return res.status(error.message === 'Access denied' ? 403 : 404).json({ 
        error: error.message
      })
    }
    
    res.status(500).json({ 
      error: 'Failed to download publication',
      message: error.message 
    })
  }
})

/**
 * DELETE /api/published/:id
 * Delete a published PDF
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const publicationId = req.params.id
    
    // Delete using storage service
    await pdfStorageService.deletePublication(publicationId, userId)

    res.json({ success: true, message: 'Publication deleted' })
  } catch (error) {
    console.error(`[DELETE /api/published/${req.params.id}] error:`, error)
    
    if (error.message === 'Publication not found' || error.message === 'Access denied') {
      return res.status(error.message === 'Access denied' ? 403 : 404).json({ 
        error: error.message
      })
    }
    
    res.status(500).json({ 
      error: 'Failed to delete publication',
      message: error.message 
    })
  }
})

// Error handling middleware for Multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large',
        message: 'PDF must be smaller than 50MB'
      })
    }
  }
  
  if (error.message && error.message.includes('Only PDF files')) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      message: 'Only PDF files are allowed'
    })
  }
  
  next(error)
})

module.exports = router
