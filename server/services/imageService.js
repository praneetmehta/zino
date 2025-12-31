/**
 * Image Service
 * Handles image uploads, processing, and multi-resolution generation
 * Storage-agnostic - uses identifiers to work with any storage provider
 */
const { storageService } = require('./storage')
const sharp = require('sharp')

class ImageService {
  constructor() {
    this.supportedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/heif',
      'image/heic',
      'image/heif-sequence',
      'image/heic-sequence'
    ]
    
    // Image size configurations
    this.sizes = {
      original: { maxWidth: 4000, maxHeight: 4000, quality: 99, format: 'jpeg' },  // JPEG for print compatibility
      display: { maxWidth: 1200, maxHeight: 1200, quality: 85, format: 'webp' },   // WebP for screen (better compression)
      thumbnail: { maxWidth: 300, maxHeight: 300, quality: 80, format: 'webp' }     // WebP for preview
    }
  }

  /**
   * Validate if file is a supported image
   */
  isValidImage(mimeType) {
    return this.supportedMimeTypes.includes(mimeType)
  }

  /**
   * Check if file is HEIF/HEIC by signature
   */
  isHEIF(buffer) {
    try {
      // Check file signature - HEIF files have 'ftyp' at bytes 4-7
      const signature = buffer.toString('ascii', 4, 8)
      const brand = buffer.toString('ascii', 8, 12)
      
      return signature === 'ftyp' && 
             (brand.startsWith('heic') || 
              brand.startsWith('heix') ||
              brand.startsWith('hevc') ||
              brand.startsWith('hevx') ||
              brand.startsWith('mif1'))
    } catch (error) {
      return false
    }
  }

  /**
   * Convert HEIF to JPEG buffer
   */
  async convertHEIFToJPEG(buffer) {
    try {
      console.log('🔄 Converting HEIF to JPEG on server...')
      
      // Try to use Sharp with HEIF support
      // If libheif is not available, this will fail gracefully
      const image = sharp(buffer, {
        unlimited: true,
        failOnError: false
      })
      
      // Convert to JPEG
      const jpegBuffer = await image
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer()
      
      console.log(`✅ HEIF converted: ${buffer.length} bytes → ${jpegBuffer.length} bytes`)
      return jpegBuffer
    } catch (error) {
      console.error('❌ HEIF conversion failed:', error.message)
      throw new Error('HEIF format not supported. Please convert to JPEG before uploading.')
    }
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

    // Skip processing for SVGs (vector format)
    if (file.mimetype === 'image/svg+xml') {
      return this.uploadSingleVariant(file, metadata)
    }

    const imageId = this.generateImageId()
    let buffer = file.buffer || file

    try {
      console.log(`📸 Processing image: ${file.originalname}, type: ${file.mimetype}, size: ${buffer.length} bytes`)
      
      // Check if file is HEIF and convert to JPEG
      if (this.isHEIF(buffer)) {
        console.log('🔍 HEIF file detected, converting to JPEG...')
        buffer = await this.convertHEIFToJPEG(buffer)
        // Update mimetype after conversion
        file.mimetype = 'image/jpeg'
      }
      
      // Get image metadata
      const image = sharp(buffer, { 
        failOnError: false,
        unlimited: true
      })
      const imageMetadata = await image.metadata()
      
      console.log(`✅ Image metadata: ${imageMetadata.format}, ${imageMetadata.width}x${imageMetadata.height}`)

      // Generate all variants
      const variants = {}

      // 1. Original (JPEG for print compatibility)
      const originalBuffer = await this.resizeImage(buffer, this.sizes.original)
      const originalResult = await storageService.uploadFile(originalBuffer, {
        filename: `${imageId}_original.jpg`,
        originalName: file.originalname,
        mimeType: 'image/jpeg',
        userId: metadata.userId,
        bookId: metadata.bookId,
        imageId
      })
      variants.original = {
        storageId: imageId,
        url: originalResult.url,
        width: imageMetadata.width,
        height: imageMetadata.height,
        size: originalBuffer.length
      }

      // 2. Display (WebP for better compression)
      const displayBuffer = await this.resizeImage(buffer, this.sizes.display)
      const displayResult = await storageService.uploadFile(displayBuffer, {
        filename: `${imageId}_display.webp`,
        originalName: file.originalname,
        mimeType: 'image/webp',
        userId: metadata.userId,
        bookId: metadata.bookId,
        imageId
      })
      const displayMeta = await sharp(displayBuffer).metadata()
      variants.display = {
        storageId: imageId,
        url: displayResult.url,
        width: displayMeta.width,
        height: displayMeta.height,
        size: displayBuffer.length
      }

      // 3. Thumbnail (WebP for smallest size)
      const thumbnailBuffer = await this.resizeImage(buffer, this.sizes.thumbnail)
      const thumbnailResult = await storageService.uploadFile(thumbnailBuffer, {
        filename: `${imageId}_thumb.webp`,
        originalName: file.originalname,
        mimeType: 'image/webp',
        userId: metadata.userId,
        bookId: metadata.bookId,
        imageId
      })
      const thumbMeta = await sharp(thumbnailBuffer).metadata()
      variants.thumbnail = {
        storageId: imageId,
        url: thumbnailResult.url,
        width: thumbMeta.width,
        height: thumbMeta.height,
        size: thumbnailBuffer.length
      }

      // Calculate total size saved
      const originalSize = file.size
      const totalProcessedSize = variants.original.size + variants.display.size + variants.thumbnail.size
      const savings = Math.round((1 - totalProcessedSize / (originalSize * 3)) * 100)

      console.log(`✅ Processed image: ${file.originalname}`)
      console.log(`   Original: ${Math.round(originalSize / 1024)}KB → ${Math.round(variants.original.size / 1024)}KB`)
      console.log(`   Display: ${Math.round(variants.display.size / 1024)}KB`)
      console.log(`   Thumbnail: ${Math.round(variants.thumbnail.size / 1024)}KB`)
      console.log(`   Total savings: ${savings}% vs uploading original 3x`)

      return {
        id: imageId,
        originalName: file.originalname,
        mimeType: 'image/jpeg',
        size: originalSize,
        userId: metadata.userId,
        uploadedAt: new Date().toISOString(),
        variants
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw new Error(`Image upload failed: ${error.message}`)
    }
  }

  /**
   * Upload single variant (for SVG or fallback)
   */
  async uploadSingleVariant(file, metadata = {}) {
    const imageId = this.generateImageId()
    const extension = this.getExtension(file.originalname)

    const uploadResult = await storageService.uploadFile(file.buffer || file, {
      filename: `${imageId}_original${extension}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      userId: metadata.userId,
      bookId: metadata.bookId,
      imageId
    })

    const variant = {
      storageId: uploadResult.id,
      url: uploadResult.url,
      width: null,
      height: null,
      size: file.size
    }

    return {
      id: imageId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      userId: metadata.userId,
      uploadedAt: new Date().toISOString(),
      variants: {
        original: variant,
        display: variant,
        thumbnail: variant
      }
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
   */
  async resizeImage(buffer, options) {
    const image = sharp(buffer, {
      failOnError: false,
      unlimited: true
    })
      .resize(options.maxWidth, options.maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
    
    // Convert to WebP or JPEG based on config
    if (options.format === 'webp') {
      return image
        .webp({ 
          quality: options.quality,
          effort: 4 // 0-6, higher = better compression but slower
        })
        .toBuffer()
    } else {
      return image
        .jpeg({ 
          quality: options.quality,
          mozjpeg: true
        })
        .toBuffer()
    }
  }
}

// Export singleton
const imageService = new ImageService()

module.exports = {
  imageService,
  ImageService
}
