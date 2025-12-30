/**
 * Storage Interface - Abstract base class for storage providers
 * Backend implementation - all storage implementations must extend this class
 */
class StorageInterface {
  /**
   * Upload a media file
   * @param {Buffer|Stream} file - The file data
   * @param {Object} metadata - File metadata (originalName, mimeType, userId, etc.)
   * @returns {Promise<{id: string, url: string, metadata: Object}>}
   */
  async uploadFile(file, metadata = {}) {
    throw new Error('uploadFile() must be implemented by storage provider')
  }

  /**
   * Delete a file
   * @param {string} id - The file ID
   * @returns {Promise<boolean>}
   */
  async deleteFile(id) {
    throw new Error('deleteFile() must be implemented by storage provider')
  }

  /**
   * Get file URL
   * @param {string} id - The file ID
   * @returns {Promise<string>}
   */
  async getFileUrl(id) {
    throw new Error('getFileUrl() must be implemented by storage provider')
  }

  /**
   * Get file stream
   * @param {string} id - The file ID
   * @returns {Promise<Stream>}
   */
  async getFileStream(id) {
    throw new Error('getFileStream() must be implemented by storage provider')
  }

  /**
   * Check if file exists
   * @param {string} id - The file ID
   * @returns {Promise<boolean>}
   */
  async fileExists(id) {
    throw new Error('fileExists() must be implemented by storage provider')
  }

  /**
   * List files
   * @param {Object} filters - Filter criteria (userId, type, etc.)
   * @returns {Promise<Array>}
   */
  async listFiles(filters = {}) {
    throw new Error('listFiles() must be implemented by storage provider')
  }
}

module.exports = { StorageInterface }
