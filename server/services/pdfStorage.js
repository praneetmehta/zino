/**
 * PDF Storage Service
 * Handles published PDF storage with abstracted storage backend
 * Can use Railway volumes or AWS S3
 */
const path = require('path')
const fs = require('fs/promises')
const { storageService } = require('./storage')

class PDFStorageService {
  constructor() {
    // In-memory cache for publication metadata
    this.metadata = new Map()
  }

  /**
   * Upload and publish a PDF
   */
  async publishPDF(pdfBuffer, { userId, title, bookId, pageCount, metadata = {} }) {

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      throw new Error('Invalid PDF buffer')
    }
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Generate unique ID for publication
    const timestamp = Date.now()
    const publicationId = `pub_${userId}_${timestamp}`
    const filename = `${publicationId}.pdf`

    try {
      // Upload PDF to storage
      const uploadResult = await storageService.uploadFile(pdfBuffer, {
        filename,
        originalName: `${title || 'zine'}.pdf`,
        mimeType: 'application/pdf',
        userId,
        bookId,
        publicationId,
      })

      // Create publication metadata
      const publication = {
        id: publicationId,
        userId,
        title: title || 'Untitled Zine',
        bookId: bookId || null,
        filename,
        storageId: uploadResult.id,
        url: uploadResult.url,
        size: pdfBuffer.length,
        pageCount: parseInt(pageCount) || 0,
        publishedAt: new Date().toISOString(),
        downloadCount: 0,
        metadata: metadata || null, // Store zineConfig and other metadata
      }

      // Store metadata (in memory for now, would use database)
      this.metadata.set(publicationId, publication)

      // Also save metadata to storage as JSON for persistence
      const metadataBuffer = Buffer.from(JSON.stringify(publication, null, 2))
      await storageService.uploadFile(metadataBuffer, {
        filename: `${publicationId}_meta.json`,
        originalName: `${publicationId}_meta.json`,
        mimeType: 'application/json',
        userId,
        publicationId,
      })

      console.log(`✅ Published PDF: "${title}" by user ${userId}`)
      console.log(`   Size: ${Math.round(pdfBuffer.length / 1024)}KB`)
      console.log(`   Pages: ${pageCount}`)
      console.log(`   Storage: ${uploadResult.url}`)

      return publication
    } catch (error) {
      console.error('Failed to publish PDF:', error)
      throw new Error(`PDF publication failed: ${error.message}`)
    }
  }

  /**
   * Get all publications for a user
   */
  async getUserPublications(userId) {
    // In a real implementation, this would query a database
    // For now, we'll return from in-memory cache
    const userPublications = Array.from(this.metadata.values())
      .filter(pub => pub.userId === userId)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    return userPublications
  }

  /**
   * Get a specific publication
   */
  async getPublication(publicationId, userId) {
    const publication = this.metadata.get(publicationId)

    if (!publication) {
      throw new Error('Publication not found')
    }

    // Verify ownership
    if (publication.userId !== userId) {
      throw new Error('Access denied')
    }

    return publication
  }

  /**
   * Download PDF file
   */
  async downloadPDF(publicationId, userId) {
    const publication = await this.getPublication(publicationId, userId)

    try {
      // Get file from storage
      const fileStream = await storageService.getFileStream(publication.storageId)

      // Update download count
      publication.downloadCount++
      this.metadata.set(publicationId, publication)

      // Save updated metadata
      const metadataBuffer = Buffer.from(JSON.stringify(publication, null, 2))
      await storageService.uploadFile(metadataBuffer, {
        filename: `${publicationId}_meta.json`,
        originalName: `${publicationId}_meta.json`,
        mimeType: 'application/json',
        userId,
        publicationId,
      })

      return {
        stream: fileStream,
        filename: publication.filename,
        title: publication.title,
        size: publication.size,
      }
    } catch (error) {
      console.error(`Failed to download PDF ${publicationId}:`, error)
      throw error
    }
  }

  /**
   * Delete a publication
   */
  async deletePublication(publicationId, userId) {
    const publication = await this.getPublication(publicationId, userId)

    try {
      // Delete PDF from storage
      await storageService.deleteFile(publication.storageId)

      // Delete metadata file
      const metadataId = `${publicationId}_meta`
      try {
        await storageService.deleteFile(metadataId)
      } catch (err) {
        console.warn('Failed to delete metadata file:', err.message)
      }

      // Remove from cache
      this.metadata.delete(publicationId)

      console.log(`🗑️  Deleted publication: "${publication.title}" by user ${userId}`)

      return true
    } catch (error) {
      console.error(`Failed to delete publication ${publicationId}:`, error)
      throw error
    }
  }

  /**
   * Get publication URL
   */
  async getPublicationUrl(publicationId, userId) {
    const publication = await this.getPublication(publicationId, userId)
    return publication.url
  }

  /**
   * Initialize service - load metadata from storage
   */
  async init() {
    console.log('📚 Initializing PDF Storage Service...')
    console.log('__dirname:', __dirname)
    
    try {
      // Get uploads directory - use environment variable or default path
      const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || require('path').join(__dirname, '../../data')
      const uploadsDir = require('path').join(VOLUME_PATH, 'uploads')
      
      console.log(`Checking uploads directory: ${uploadsDir}`)
      
      // Check if directory exists
      try {
        await fs.access(uploadsDir)
        console.log('✅ Uploads directory found')
      } catch (err) {
        console.log('⚠️  Uploads directory not found, skipping PDF metadata loading')
        console.log('   Error:', err.message)
        console.log('   Path:', uploadsDir)
        console.log('✅ PDF Storage Service initialized (empty)')
        return
      }
      
      // Scan for metadata files
      const files = await fs.readdir(uploadsDir)
      const metadataFiles = files.filter(f => f.endsWith('_meta.json'))
      
      console.log(`Found ${metadataFiles.length} publication metadata files`)
      
      // Load each metadata file
      for (const metaFile of metadataFiles) {
        try {
          const metaPath = path.join(uploadsDir, metaFile)
          const metaContent = await fs.readFile(metaPath, 'utf8')
          const publication = JSON.parse(metaContent)
          
          // Store in memory cache
          this.metadata.set(publication.id, publication)
          console.log(`  ✅ Loaded: ${publication.title} (${publication.id})`)
        } catch (err) {
          console.warn(`  ⚠️  Failed to load ${metaFile}:`, err.message)
        }
      }
      
      console.log(`✅ PDF Storage Service initialized with ${this.metadata.size} publications`)
    } catch (error) {
      console.error('Failed to initialize PDF Storage Service:', error)
      console.error('Stack:', error.stack)
      console.log('✅ PDF Storage Service initialized (empty)')
    }
  }
}

// Export singleton
const pdfStorageService = new PDFStorageService()

module.exports = {
  pdfStorageService,
  PDFStorageService,
}
