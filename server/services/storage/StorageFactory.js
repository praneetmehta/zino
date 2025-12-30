/**
 * Storage Factory
 * Creates the appropriate storage provider based on environment configuration
 */
const { FilesystemStorage } = require('./FilesystemStorage')
const { S3Storage } = require('./S3Storage')

class StorageFactory {
  /**
   * Create a storage provider instance
   * @param {string} type - Storage type: 'filesystem' | 's3'
   * @param {Object} config - Provider-specific configuration
   * @returns {StorageInterface}
   */
  static create(type = null, config = {}) {
    const storageType = type || process.env.STORAGE_PROVIDER || 'filesystem'

    switch (storageType.toLowerCase()) {
      case 's3':
        console.log('📦 Using S3 storage provider')
        return new S3Storage(config)

      case 'filesystem':
      default:
        console.log('📦 Using Filesystem storage provider')
        return new FilesystemStorage(config)
    }
  }

  /**
   * List available storage providers
   */
  static getAvailableProviders() {
    return ['filesystem', 's3']
  }
}

module.exports = { StorageFactory }
