/**
 * Authentication Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken')

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

/**
 * Authenticate JWT token
 * Adds req.user with decoded token data
 */
function authenticateJWT(req, res, next) {
  // Skip auth only if explicitly configured (not just in development)
  if (process.env.SKIP_AUTH === 'true') {
    req.user = {
      id: 'temp-user',
      email: 'temp@local.dev',
      role: 'admin', // Admin role for development
      isTemp: true,
    }
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format' })
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(403).json({ error: 'Invalid token' })
  }
}

/**
 * Require admin role
 * Must be used after authenticateJWT
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

/**
 * Optional authentication
 * Doesn't fail if no token, but populates req.user if valid token provided
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next()
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next()
  }

  try {
    const token = parts[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  next()
}

/**
 * Generate JWT token
 */
function generateToken(user, expiresIn = '24h') {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn }
  )
}

module.exports = {
  authenticateJWT,
  requireAdmin,
  optionalAuth,
  generateToken,
  JWT_SECRET,
}
