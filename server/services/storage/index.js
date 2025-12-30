/**
 * Storage Service - Singleton
 * Provides unified interface for file storage operations
 */
const { StorageFactory } = require('./StorageFactory')

class StorageService {
  constructor() {
    this.provider = null
    this.initialized = false
  }

  /**
   * Initialize the storage service
   */
  init(type = null, config = {}) {
    if (this.initialized) {
      console.warn('StorageService already initialized')
      return
    }

    this.provider = StorageFactory.create(type, config)
    this.initialized = true
    console.log('✅ Storage service initialized')
  }

  /**
   * Ensure provider is initialized
   */
  _ensureInitialized() {
    if (!this.initialized) {
      this.init() // Auto-initialize with defaults
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(file, metadata = {}) {
    this._ensureInitialized()
    return this.provider.uploadFile(file, metadata)
  }

  /**
   * Delete a file
   */
  async deleteFile(id) {
    this._ensureInitialized()
    return this.provider.deleteFile(id)
  }

  /**
   * Get file URL
   */
  async getFileUrl(id) {
    this._ensureInitialized()
    return this.provider.getFileUrl(id)
  }

  /**
   * Get file stream
   */
  async getFileStream(id) {
    this._ensureInitialized()
    return this.provider.getFileStream(id)
  }

  /**
   * Check if file exists
   */
  async fileExists(id) {
    this._ensureInitialized()
    return this.provider.fileExists(id)
  }

  /**
   * List files
   */
  async listFiles(filters = {}) {
    this._ensureInitialized()
    return this.provider.listFiles(filters)
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    this._ensureInitialized()
    return {
      type: this.provider.constructor.name,
      initialized: this.initialized,
    }
  }
}

// Export singleton instance
const storageService = new StorageService()

module.exports = {
  storageService,
  StorageFactory,
  StorageInterface: require('./StorageInterface').StorageInterface,
}
