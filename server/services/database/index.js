/**
 * Database Connection Service
 * Manages PostgreSQL connection pool
 */

const { Pool } = require('pg')

class DatabaseService {
  constructor() {
    this.pool = null
  }

  /**
   * Initialize database connection pool
   */
  async init() {
    const dbUrl = process.env.DATABASE_URL

    if (!dbUrl) {
      console.warn('⚠️  DATABASE_URL not set - database features disabled')
      return
    }

    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false // Required for Railway/Heroku
        } : false,
        max: 20, // Maximum pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })

      // Test connection
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      console.log('✅ Database connected successfully')
      
      // Initialize schema
      await this.initSchema()
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      throw error
    }
  }

  /**
   * Initialize database schema
   * Creates tables if they don't exist
   */
  async initSchema() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `

    try {
      await this.pool.query(createUsersTable)
      console.log('✅ Database schema initialized')
    } catch (error) {
      console.error('❌ Failed to initialize schema:', error.message)
      throw error
    }
  }

  /**
   * Execute a query
   */
  async query(text, params) {
    if (!this.pool) {
      throw new Error('Database not initialized')
    }
    
    const start = Date.now()
    try {
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      
      if (process.env.LOG_QUERIES === 'true') {
        console.log('Query executed:', { text, duration, rows: result.rowCount })
      }
      
      return result
    } catch (error) {
      console.error('Database query error:', error.message)
      throw error
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  async getClient() {
    if (!this.pool) {
      throw new Error('Database not initialized')
    }
    return await this.pool.connect()
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.end()
      console.log('Database connection closed')
    }
  }

  /**
   * Check if database is connected
   */
  isConnected() {
    return !!this.pool
  }
}

// Export singleton instance
const databaseService = new DatabaseService()

module.exports = {
  databaseService,
  DatabaseService,
}
