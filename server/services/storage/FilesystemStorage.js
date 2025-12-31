/**
 * Filesystem Storage Implementation
 * Stores files on local filesystem
 */
const fs = require('fs/promises')
const fsSync = require('fs')
const path = require('path')
const { StorageInterface } = require('./StorageInterface')

class FilesystemStorage extends StorageInterface {
  constructor(config = {}) {
    super()
    
    // Use Railway volume path if available, otherwise local data directory
    const VOLUME_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../../data')
    this.uploadDir = config.uploadDir || path.join(VOLUME_PATH, 'uploads')
    
    // Construct base URL from environment
    this.baseUrl = config.baseUrl || process.env.BASE_URL || 'http://localhost:4876'
    
    console.log(`📦 Storage upload directory: ${this.uploadDir}`)
    console.log(`📦 Storage base URL: ${this.baseUrl}`)
    
    this.ensureUploadDir()
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create upload directory:', error)
    }
  }

  /**
   * Upload a file to filesystem
   */
  async uploadFile(file, metadata = {}) {
    // Use provided filename or generate ID
    const filename = metadata.filename || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(metadata.originalName || '')}`
    
    // Organize by book if bookId provided
    let targetDir = this.uploadDir
    let urlPath = filename
    
    if (metadata.bookId) {
      targetDir = path.join(this.uploadDir, metadata.bookId)
      await fs.mkdir(targetDir, { recursive: true })
      urlPath = `${metadata.bookId}/${filename}`
    }
    
    const filePath = path.join(targetDir, filename)

    // Write file
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filePath, file)
    } else if (file.path) {
      // If it's a multer file
      await fs.copyFile(file.path, filePath)
      await fs.unlink(file.path) // Remove temp file
    } else {
      throw new Error('Invalid file format')
    }

    // Get file stats
    const stats = await fs.stat(filePath)
    
    // Extract ID from filename (before extension and variant suffix)
    const id = metadata.imageId || filename.split('.')[0]

    return {
      id,
      filename,
      url: `${this.baseUrl}/uploads/${urlPath}`,
      path: filePath,
      size: stats.size,
      mimeType: metadata.mimeType,
      originalName: metadata.originalName,
      userId: metadata.userId,
      uploadedAt: new Date().toISOString(),
    }
  }

  /**
   * Delete a file from filesystem
   */
  async deleteFile(id) {
    try {
      // First try the root directory
      const files = await fs.readdir(this.uploadDir)
      let file = files.find(f => f.startsWith(id))
      let filePath
      
      if (file) {
        // Found in root directory
        filePath = path.join(this.uploadDir, file)
      } else {
        // Search in subdirectories (like book-xxx/)
        const entries = await fs.readdir(this.uploadDir, { withFileTypes: true })
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const subDir = path.join(this.uploadDir, entry.name)
            const subFiles = await fs.readdir(subDir)
            file = subFiles.find(f => f.startsWith(id))
            
            if (file) {
              filePath = path.join(subDir, file)
              break
            }
          }
        }
      }
      
      if (!filePath) {
        return false
      }

      await fs.unlink(filePath)
      return true
    } catch (error) {
      console.error('Failed to delete file:', error)
      return false
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(id) {
    const files = await fs.readdir(this.uploadDir)
    const file = files.find(f => f.startsWith(id))
    
    if (!file) {
      throw new Error('File not found')
    }

    return `${this.baseUrl}/uploads/${file}`
  }

  /**
   * Get file stream
   */
  async getFileStream(id) {
    // First try the root directory
    let files = await fs.readdir(this.uploadDir)
    let file = files.find(f => f.startsWith(id))
    
    let filePath
    
    if (file) {
      // Found in root directory
      filePath = path.join(this.uploadDir, file)
    } else {
      // Search in subdirectories (like book-xxx/)
      const entries = await fs.readdir(this.uploadDir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDir = path.join(this.uploadDir, entry.name)
          const subFiles = await fs.readdir(subDir)
          file = subFiles.find(f => f.startsWith(id))
          
          if (file) {
            filePath = path.join(subDir, file)
            break
          }
        }
      }
    }
    
    if (!filePath) {
      throw new Error('File not found')
    }

    return fsSync.createReadStream(filePath)
  }

  /**
   * Check if file exists
   */
  async fileExists(id) {
    try {
      const files = await fs.readdir(this.uploadDir)
      return files.some(f => f.startsWith(id))
    } catch (error) {
      return false
    }
  }

  /**
   * List files
   */
  async listFiles(filters = {}) {
    const files = await fs.readdir(this.uploadDir)
    const fileDetails = []

    for (const file of files) {
      const filePath = path.join(this.uploadDir, file)
      const stats = await fs.stat(filePath)
      const id = file.split('-')[0] + '-' + file.split('-')[1] // Extract ID from filename
      
      fileDetails.push({
        id,
        filename: file,
        url: `${this.baseUrl}/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      })
    }

    // Apply filters (simplified - expand as needed)
    if (filters.userId) {
      // Would need metadata file to filter by userId
      // For now, return all
    }

    return fileDetails
  }
}

module.exports = { FilesystemStorage }
