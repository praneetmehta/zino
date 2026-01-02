/**
 * Authentication Routes
 * Handles Google OAuth and user session management
 */

const express = require('express')
const router = express.Router()
const { generateToken, authenticateJWT } = require('../middleware/auth')
const { googleAuthService } = require('../services/auth/googleAuth')
const { databaseService } = require('../services/database')
const User = require('../models/User')

/**
 * POST /auth/google
 * Exchange Google authorization code for JWT token
 */
router.post('/google', async (req, res) => {
  try {
    const { code, credential } = req.body

    if (!code && !credential) {
      return res.status(400).json({ error: 'Authorization code or credential required' })
    }

    // Check if Google OAuth is configured
    if (!googleAuthService.isConfigured()) {
      // Fallback to mock user if no OAuth configured
      const mockUser = {
        id: 'dev-user-alice',
        email: 'alice@ziner.local',
        name: 'Alice (Admin)',
        role: 'admin',
      }

      const token = generateToken(mockUser, '24h')
      const expiresIn = 24 * 60 * 60 * 1000

      return res.json({
        user: mockUser,
        token,
        expiresIn,
      })
    }

    let googleProfile

    // Handle Google One Tap (ID token)
    if (credential) {
      googleProfile = await googleAuthService.verifyIdToken(credential)
    } 
    // Handle traditional OAuth flow (authorization code)
    else if (code) {
      googleProfile = await googleAuthService.getProfileFromCode(code)
    }

    let user

    // If database is connected, save user
    if (databaseService.isConnected()) {
      const dbUser = await User.findOrCreate(googleProfile)
      user = User.toJSON(dbUser)
    } else {
      // No database - use Google profile directly
      user = {
        id: `google_${googleProfile.id}`,
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        role: 'user',
      }
    }

    // Auto-promote specific email to admin
    if (user.email === 'praneet.mehta@gmail.com' && user.role !== 'admin') {
      console.log('🔐 Auto-promoting praneet.mehta@gmail.com to admin')
      user.role = 'admin'
      
      // If database is connected, update the role in DB
      if (databaseService.isConnected()) {
        await User.updateRole(user.id, 'admin')
      }
    }

    // Generate JWT token
    const token = generateToken(user, '24h')
    const expiresIn = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    res.json({
      user,
      token,
      expiresIn,
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({ 
      error: 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * POST /auth/logout
 * Invalidate user session
 */
router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    // TODO: In production, add token to blacklist or invalidate session
    
    res.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    // If database is connected, fetch fresh user data
    if (databaseService.isConnected() && !req.user.isTemp) {
      const dbUser = await User.findById(req.user.id)
      if (dbUser) {
        return res.json({ user: User.toJSON(dbUser) })
      }
    }

    // Fallback to JWT data
    res.json({ user: req.user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user info' })
  }
})

module.exports = router
