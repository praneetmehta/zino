/**
 * Image Upload Routes
 * Handles image upload with multipart/form-data
 */
const express = require('express')
const router = express.Router()
const { imageService } = require('../services/imageService')
const { optionalAuth } = require('../middleware/auth')
const fs = require('fs/promises')
const path = require('path')

// Helper to update book's mediaAssets
// Use Railway volume path if available, otherwise local data directory
const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', 'data')
const DATA_DIR = path.join(VOLUME_PATH, 'books')

const updateBookMediaAssets = async (bookId, imageMetadata) => {
  if (!bookId) return
  
  try {
    const bookPath = path.join(DATA_DIR, `${bookId}.json`)
    
    // Check if book exists first
    try {
      await fs.access(bookPath)
    } catch {
      // Book doesn't exist yet - will be created on first manual save
      console.log(`⏭️  Skipping auto-save for ${bookId} (book not saved yet)`)
      return
    }
    
    const bookData = JSON.parse(await fs.readFile(bookPath, 'utf8'))
    
    // Initialize mediaAssets if it doesn't exist
    if (!bookData.data) bookData.data = {}
    if (!bookData.data.mediaAssets) bookData.data.mediaAssets = []
    
    // Add or update the image in mediaAssets
    const existingIndex = bookData.data.mediaAssets.findIndex(a => a.imageId === imageMetadata.id)
    
    const assetData = {
      id: imageMetadata.id,
      imageId: imageMetadata.id,
      name: imageMetadata.originalName,
      url: imageMetadata.variants.display.url,
      thumbnail: imageMetadata.variants.thumbnail.url,
      type: imageMetadata.mimeType,
      originalUrl: imageMetadata.variants.original.url,
      isUploading: false
    }
    
    if (existingIndex >= 0) {
      // Update existing
      bookData.data.mediaAssets[existingIndex] = assetData
    } else {
      // Add new
      bookData.data.mediaAssets.push(assetData)
    }
    
    // Update metadata
    bookData.metadata = bookData.metadata || {}
    bookData.metadata.mediaCount = bookData.data.mediaAssets.length
    bookData.updatedAt = new Date().toISOString()
    
    // Save back
    await fs.writeFile(bookPath, JSON.stringify(bookData, null, 2), 'utf8')
    console.log(`✅ Auto-saved image ${imageMetadata.id} to book ${bookId}`)
  } catch (error) {
    console.error(`Failed to update book ${bookId} with new image:`, error)
  }
}

// Simple in-memory storage for file uploads
// We'll process the buffer and pass it to the storage service
const multer = require('multer')

// Max file size from env or default to 50MB
const MAX_FILE_SIZE = process.env.MAX_IMAGE_SIZE 
  ? parseInt(process.env.MAX_IMAGE_SIZE) * 1024 * 1024 
  : 50 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // Configurable limit (default 50MB)
    files: 20, // Max 20 files per upload
  },
  fileFilter: (req, file, cb) => {
    if (imageService.isValidImage(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'))
    }
  }
})

/**
 * POST /api/images/upload
 * Upload a single image
 */
router.post('/upload', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const metadata = {
      userId: req.user?.id || null,
      albumId: req.body.albumId || null,
      bookId: req.body.bookId || null,
    }

    const imageMetadata = await imageService.uploadImage(req.file, metadata)
    
    // Auto-save to book if bookId provided
    await updateBookMediaAssets(metadata.bookId, imageMetadata)

    res.status(201).json({
      success: true,
      image: imageMetadata
    })
  } catch (error) {
    console.error('[POST /api/images/upload] error:', error)
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message 
    })
  }
})

/**
 * POST /api/images/upload-multiple
 * Upload multiple images at once
 */
router.post('/upload-multiple', optionalAuth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' })
    }

    const metadata = {
      userId: req.user?.id || null,
      albumId: req.body.albumId || null,
      bookId: req.body.bookId || null,
    }

    const uploadedImages = []
    const errors = []

    for (const file of req.files) {
      try {
        const imageMetadata = await imageService.uploadImage(file, metadata)
        uploadedImages.push(imageMetadata)
        
        // Auto-save to book if bookId provided
        await updateBookMediaAssets(metadata.bookId, imageMetadata)
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        })
      }
    }

    res.status(201).json({
      success: true,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: req.files.length,
        uploaded: uploadedImages.length,
        failed: errors.length
      }
    })
  } catch (error) {
    console.error('[POST /api/images/upload-multiple] error:', error)
    res.status(500).json({ 
      error: 'Failed to upload images',
      message: error.message 
    })
  }
})

/**
 * DELETE /api/images/:id
 * Delete an image and all its variants
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const imageId = req.params.id

    const deleted = await imageService.deleteImage(imageId)

    if (deleted) {
      res.json({ success: true, message: 'Image deleted' })
    } else {
      res.status(404).json({ error: 'Image not found' })
    }
  } catch (error) {
    console.error(`[DELETE /api/images/${req.params.id}] error:`, error)
    res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message 
    })
  }
})

/**
 * GET /api/images/:id/url
 * Get image URL by ID and variant
 */
router.get('/:id/url', async (req, res) => {
  try {
    const imageId = req.params.id
    const variant = req.query.variant || 'display'

    const url = await imageService.getImageUrl(imageId, variant)

    res.json({ url })
  } catch (error) {
    console.error(`[GET /api/images/${req.params.id}/url] error:`, error)
    res.status(404).json({ 
      error: 'Image not found',
      message: error.message 
    })
  }
})

// Error handling middleware for Multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024)
      return res.status(413).json({ 
        error: 'File too large',
        message: `Image must be smaller than ${maxSizeMB}MB`,
        maxSize: MAX_FILE_SIZE
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files',
        message: 'Maximum 20 images per upload'
      })
    }
    return res.status(400).json({ 
      error: 'Upload error',
      message: error.message 
    })
  }
  
  // Other errors
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      message: 'Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)'
    })
  }
  
  next(error)
})

module.exports = router
