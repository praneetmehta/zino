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
    this.uploadDir = config.uploadDir || path.join(__dirname, '../../data/uploads')
    this.baseUrl = config.baseUrl || process.env.BASE_URL || 'http://localhost:4876'
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
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const extension = path.extname(metadata.originalName || '')
    const filename = `${id}${extension}`
    const filePath = path.join(this.uploadDir, filename)

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

    return {
      id,
      filename,
      url: `${this.baseUrl}/uploads/${filename}`,
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
      // Find file by ID (could be just ID or ID with extension)
      const files = await fs.readdir(this.uploadDir)
      const file = files.find(f => f.startsWith(id))
      
      if (!file) {
        return false
      }

      const filePath = path.join(this.uploadDir, file)
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
    const files = await fs.readdir(this.uploadDir)
    const file = files.find(f => f.startsWith(id))
    
    if (!file) {
      throw new Error('File not found')
    }

    const filePath = path.join(this.uploadDir, file)
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
