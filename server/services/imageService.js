/**
 * Image Service
 * Handles image uploads, processing, and multi-resolution generation
 * Storage-agnostic - uses identifiers to work with any storage provider
 */
const { storageService } = require('./storage')

class ImageService {
  constructor() {
    this.supportedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
    
    // Image size configurations
    this.sizes = {
      original: { maxWidth: 4000, maxHeight: 4000, quality: 95 },
      display: { maxWidth: 1200, maxHeight: 1200, quality: 85 },
      thumbnail: { maxWidth: 300, maxHeight: 300, quality: 80 }
    }
  }

  /**
   * Validate if file is a supported image
   */
  isValidImage(mimeType) {
    return this.supportedMimeTypes.includes(mimeType)
  }

  /**
   * Generate a unique image identifier
   */
  generateImageId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `img_${timestamp}_${random}`
  }

  /**
   * Process and upload image with multiple resolutions
   * Returns image metadata with identifiers
   */
  async uploadImage(file, metadata = {}) {
    if (!this.isValidImage(file.mimetype)) {
      throw new Error(`Unsupported image type: ${file.mimetype}`)
    }

    const imageId = this.generateImageId()
    const extension = this.getExtension(file.originalname)

    try {
      // For now, we'll upload the original file as-is
      // Image resizing will be added when sharp is installed
      const uploadResult = await storageService.uploadFile(file.buffer || file, {
        originalName: file.originalname,
        mimeType: file.mimetype,
        userId: metadata.userId,
        imageId,
        variant: 'original'
      })

      // Build image metadata
      const imageMetadata = {
        id: imageId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId: metadata.userId,
        uploadedAt: new Date().toISOString(),
        variants: {
          original: {
            storageId: uploadResult.id,
            url: uploadResult.url,
            width: null, // Will be set when sharp is added
            height: null,
            size: file.size
          }
        }
      }

      // TODO: Generate thumbnail and display versions when sharp is installed
      // For now, use original for all variants
      imageMetadata.variants.display = { ...imageMetadata.variants.original }
      imageMetadata.variants.thumbnail = { ...imageMetadata.variants.original }

      return imageMetadata
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  /**
   * Get image URL by identifier and variant
   */
  async getImageUrl(imageId, variant = 'display') {
    try {
      // For filesystem storage, the URL is constructed from the storage ID
      // The imageId can be used to look up the storage ID
      // For now, we'll use the imageId directly as the storage ID
      return await storageService.getFileUrl(imageId)
    } catch (error) {
      console.error(`Failed to get image URL for ${imageId}:`, error)
      throw error
    }
  }

  /**
   * Delete image and all its variants
   */
  async deleteImage(imageId) {
    try {
      // Delete all variants
      // This would require tracking which storage IDs belong to this imageId
      // For now, delete by the main ID
      const deleted = await storageService.deleteFile(imageId)
      return deleted
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error)
      return false
    }
  }

  /**
   * Get file extension from filename
   */
  getExtension(filename) {
    const match = filename.match(/\.[^.]+$/)
    return match ? match[0] : '.jpg'
  }

  /**
   * Process image buffer to create resized variant
   * Placeholder for when sharp is installed
   */
  async resizeImage(buffer, options) {
    // TODO: Implement with sharp
    // const sharp = require('sharp')
    // return sharp(buffer)
    //   .resize(options.maxWidth, options.maxHeight, { fit: 'inside', withoutEnlargement: true })
    //   .jpeg({ quality: options.quality })
    //   .toBuffer()
    
    // For now, return original buffer
    return buffer
  }
}

// Export singleton
const imageService = new ImageService()

module.exports = {
  imageService,
  ImageService
}
