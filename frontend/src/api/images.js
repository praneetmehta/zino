/**
 * Images API
 * Handles image upload and management
 */
import env from '@/config/env.js'

const API_BASE_URL = env.apiUrl

/**
 * Upload a single image
 * @param {File} file - The image file to upload (should already be converted if HEIF)
 * @param {Object} metadata - Optional metadata (bookId, albumId, etc.)
 * @returns {Promise<Object>} Image metadata with id and URLs
 */
export async function uploadImage(file, metadata = {}) {
  const formData = new FormData()
  formData.append('image', file)
  
  // Add metadata as JSON string or individual fields
  if (metadata.bookId) formData.append('bookId', metadata.bookId)
  if (metadata.albumId) formData.append('albumId', metadata.albumId)

  const res = await fetch(`${API_BASE_URL}/api/images/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type - browser sets it with boundary for multipart
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(error.message || error.error || 'Failed to upload image')
  }

  const data = await res.json()
  return data.image
}

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files (should already be converted if HEIF)
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Upload results with images array
 */
export async function uploadMultipleImages(files, metadata = {}) {
  const formData = new FormData()
  
  files.forEach(file => {
    formData.append('images', file)
  })
  
  if (metadata.bookId) formData.append('bookId', metadata.bookId)
  if (metadata.albumId) formData.append('albumId', metadata.albumId)

  const res = await fetch(`${API_BASE_URL}/api/images/upload-multiple`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(error.message || error.error || 'Failed to upload images')
  }

  return await res.json()
}

/**
 * Delete an image
 * @param {string} imageId - The image identifier
 * @returns {Promise<boolean>}
 */
export async function deleteImage(imageId) {
  const res = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Delete failed' }))
    throw new Error(error.message || error.error || 'Failed to delete image')
  }

  const data = await res.json()
  return data.success
}

/**
 * Get image URL by ID and variant
 * @param {string} imageId - The image identifier
 * @param {string} variant - The variant (original, display, thumbnail)
 * @returns {Promise<string>} The image URL
 */
export async function getImageUrl(imageId, variant = 'display') {
  const res = await fetch(`${API_BASE_URL}/api/images/${imageId}/url?variant=${variant}`)

  if (!res.ok) {
    throw new Error('Failed to get image URL')
  }

  const data = await res.json()
  return data.url
}
