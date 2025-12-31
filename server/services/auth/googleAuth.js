/**
 * Google OAuth Service
 * Handles Google OAuth 2.0 authentication flow
 */

const { OAuth2Client } = require('google-auth-library')

class GoogleAuthService {
  constructor() {
    this.client = null
  }

  /**
   * Initialize Google OAuth client
   */
  init() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !clientSecret) {
      console.warn('⚠️  Google OAuth not configured - using mock authentication')
      return
    }

    this.client = new OAuth2Client(
      clientId,
      clientSecret,
      redirectUri
    )

    console.log('✅ Google OAuth initialized')
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code) {
    if (!this.client) {
      throw new Error('Google OAuth not initialized')
    }

    try {
      console.log('Attempting to exchange code with Google...')
      const { tokens } = await this.client.getToken(code)
      console.log('✅ Tokens received from Google')
      return tokens
    } catch (error) {
      console.error('❌ Failed to exchange code for tokens:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      })
      throw new Error(`Failed to authenticate with Google: ${error.message}`)
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken) {
    if (!this.client) {
      throw new Error('Google OAuth not initialized')
    }

    try {
      this.client.setCredentials({ access_token: accessToken })
      
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get user info:', error.message)
      throw new Error('Failed to get user information from Google')
    }
  }

  /**
   * Verify ID token (for Google One Tap)
   */
  async verifyIdToken(idToken) {
    if (!this.client) {
      throw new Error('Google OAuth not initialized')
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      
      // Transform to match our expected profile format
      return {
        id: payload.sub, // Google user ID
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified_email: payload.email_verified,
      }
    } catch (error) {
      console.error('Failed to verify ID token:', error.message)
      throw new Error('Invalid ID token')
    }
  }

  /**
   * Exchange authorization code for user profile
   */
  async getProfileFromCode(code) {
    const tokens = await this.exchangeCodeForTokens(code)
    const userInfo = await this.getUserInfo(tokens.access_token)
    
    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email,
    }
  }

  /**
   * Check if Google OAuth is configured
   */
  isConfigured() {
    return !!this.client
  }
}

// Export singleton instance
const googleAuthService = new GoogleAuthService()

module.exports = {
  googleAuthService,
  GoogleAuthService,
}
