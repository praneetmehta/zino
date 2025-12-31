/**
 * User Model
 * Database operations for users
 */

const { databaseService } = require('../services/database')
const crypto = require('crypto')

class User {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await databaseService.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId) {
    const result = await databaseService.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    )
    return result.rows[0] || null
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await databaseService.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  }

  /**
   * Create a new user
   */
  static async create(userData) {
    const id = User.generateId()
    const { googleId, email, name, avatar, role = 'user' } = userData

    const result = await databaseService.query(
      `INSERT INTO users (id, google_id, email, name, avatar, role, created_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, googleId, email, name, avatar, role]
    )

    return result.rows[0]
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id) {
    const result = await databaseService.query(
      `UPDATE users 
       SET last_login_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  }

  /**
   * Update user profile
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'avatar', 'role']
    const fields = []
    const values = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update')
    }

    // Add updated_at
    fields.push(`updated_at = NOW()`)

    // Add id as last parameter
    values.push(id)

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await databaseService.query(query, values)
    return result.rows[0]
  }

  /**
   * Delete user
   */
  static async delete(id) {
    await databaseService.query('DELETE FROM users WHERE id = $1', [id])
  }

  /**
   * Find or create user (used during OAuth)
   */
  static async findOrCreate(googleProfile) {
    const { id: googleId, email, name, picture } = googleProfile

    // Try to find existing user by Google ID
    let user = await User.findByGoogleId(googleId)

    if (user) {
      // Update last login
      user = await User.updateLastLogin(user.id)
      return user
    }

    // Check if user exists with same email (link accounts)
    user = await User.findByEmail(email)
    if (user) {
      // Update Google ID to link accounts
      const result = await databaseService.query(
        `UPDATE users 
         SET google_id = $1, last_login_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [googleId, user.id]
      )
      return result.rows[0]
    }

    // Create new user
    return await User.create({
      googleId,
      email,
      name,
      avatar: picture,
      role: 'user',
    })
  }

  /**
   * List all users (admin only)
   */
  static async findAll(options = {}) {
    const { limit = 100, offset = 0, orderBy = 'created_at', order = 'DESC' } = options

    const query = `
      SELECT * FROM users 
      ORDER BY ${orderBy} ${order}
      LIMIT $1 OFFSET $2
    `

    const result = await databaseService.query(query, [limit, offset])
    return result.rows
  }

  /**
   * Generate unique user ID
   */
  static generateId() {
    return `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
  }

  /**
   * Convert database row to user object (remove sensitive data)
   */
  static toJSON(user) {
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    }
  }
}

module.exports = User
