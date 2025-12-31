/**
 * Image Converter Utility
 * Handles conversion of HEIF/HEIC images to web-compatible formats
 */
import heic2any from 'heic2any'

/**
 * Check if a file is HEIF/HEIC format
 * @param {File} file - The file to check
 * @returns {boolean}
 */
export function isHEIF(file) {
  const heifExtensions = ['.heif', '.heic']
  const heifMimeTypes = ['image/heif', 'image/heic', 'image/heif-sequence', 'image/heic-sequence']
  
  const fileName = file.name.toLowerCase()
  const hasHeifExtension = heifExtensions.some(ext => fileName.endsWith(ext))
  const hasHeifMimeType = heifMimeTypes.includes(file.type.toLowerCase())
  
  return hasHeifExtension || hasHeifMimeType
}

/**
 * Convert HEIF/HEIC image to JPEG
 * @param {File} file - The HEIF/HEIC file to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<File>} Converted JPEG file
 */
export async function convertHEIFToJPEG(file, options = {}) {
  const {
    quality = 0.92,
    toType = 'image/jpeg'
  } = options

  try {
    console.log(`Converting HEIF image: ${file.name}`)
    
    // Convert using heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: toType,
      quality: quality
    })

    // Handle multiple outputs (heic2any can return array)
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob

    // Create new File object with converted blob
    const originalName = file.name.replace(/\.(heif|heic)$/i, '')
    const newFileName = `${originalName}.jpg`
    
    const convertedFile = new File([blob], newFileName, {
      type: toType,
      lastModified: Date.now()
    })

    console.log(`✅ Converted ${file.name} (${formatBytes(file.size)}) → ${newFileName} (${formatBytes(convertedFile.size)})`)
    
    return convertedFile
  } catch (error) {
    console.error('HEIF conversion failed:', error)
    throw new Error(`Failed to convert HEIF image: ${error.message}`)
  }
}

/**
 * Process image file - convert if HEIF, otherwise return as-is
 * @param {File} file - The image file to process
 * @param {Object} options - Processing options
 * @returns {Promise<File>} Processed file
 */
export async function processImageFile(file, options = {}) {
  if (isHEIF(file)) {
    return await convertHEIFToJPEG(file, options)
  }
  return file
}

/**
 * Process multiple image files
 * @param {File[]} files - Array of image files
 * @param {Object} options - Processing options
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<File[]>} Array of processed files
 */
export async function processMultipleImages(files, options = {}, onProgress = null) {
  const processedFiles = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name)
    }
    
    try {
      const processedFile = await processImageFile(file, options)
      processedFiles.push(processedFile)
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error)
      // Still include original file if conversion fails
      processedFiles.push(file)
    }
  }
  
  return processedFiles
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get supported image formats
 * @returns {string[]} Array of supported MIME types
 */
export function getSupportedImageFormats() {
  return [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heif',
    'image/heic',
    'image/heif-sequence',
    'image/heic-sequence'
  ]
}

/**
 * Get file accept string for input element
 * @returns {string}
 */
export function getImageAcceptString() {
  return '.jpg,.jpeg,.png,.gif,.webp,.heif,.heic'
}
