import env from '@/config/env.js'

/**
 * Authentication Service
 * Handles Google OAuth, session management, and role-based access
 */
export class AuthService {
  constructor() {
    this.user = null
    this.token = null
    this.tokenExpiry = null
    this.listeners = []
  }

  /**
   * Initialize auth service
   */
  async init() {
    // Check for existing session
    const savedAuth = this.loadFromStorage()
    if (savedAuth) {
      this.user = savedAuth.user
      this.token = savedAuth.token
      this.tokenExpiry = savedAuth.tokenExpiry

      // Verify token is still valid
      if (this.isTokenExpired()) {
        await this.logout()
      } else {
        this.notifyListeners('login', this.user)
      }
    }

    // In development mode with SKIP_AUTH, create temp user
    if (env.isDevelopment() && env.skipAuth && !this.user) {
      await this.loginAsTemp()
    }
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle() {
    try {
      // Load Google Identity Services
      await this.loadGoogleIdentity()

      return new Promise((resolve, reject) => {
        const client = google.accounts.oauth2.initCodeClient({
          client_id: env.googleClientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (response) => {
            try {
              // Exchange code for token with backend
              const result = await this.exchangeCodeForToken(response.code)
              resolve(result)
            } catch (error) {
              reject(error)
            }
          },
        })

        client.requestCode()
      })
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code) {
    const response = await fetch(`${env.apiUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const data = await response.json()
    this.setSession(data.user, data.token, data.expiresIn)

    return data
  }

  /**
   * Login as temporary user (development only)
   */
  async loginAsTemp() {
    if (!env.isDevelopment()) {
      throw new Error('Temp login only available in development')
    }

    // Create realistic mock user for development
    const mockUsers = [
      {
        id: 'dev-user-1',
        email: 'alice.dev@ziner.local',
        name: 'Alice Developer',
        role: 'user',
        isTemp: true,
        avatar: '🎨',
      },
      {
        id: 'dev-admin-1',
        email: 'admin.dev@ziner.local',
        name: 'Admin Developer',
        role: 'admin',
        isTemp: true,
        avatar: '⚙️',
      }
    ]

    // Random user or fixed based on localStorage
    let selectedUser
    const savedUserId = localStorage.getItem('dev_user_id')
    
    if (savedUserId) {
      selectedUser = mockUsers.find(u => u.id === savedUserId) || mockUsers[0]
    } else {
      selectedUser = mockUsers[0] // Default to regular user
      localStorage.setItem('dev_user_id', selectedUser.id)
    }

    this.setSession(selectedUser, 'temp-token', 86400000) // 24 hours
    env.log('Logged in as temporary user:', selectedUser.name)
  }

  /**
   * Set session data
   */
  setSession(user, token, expiresIn) {
    this.user = user
    this.token = token
    this.tokenExpiry = Date.now() + expiresIn

    // Save to localStorage
    this.saveToStorage({
      user,
      token,
      tokenExpiry: this.tokenExpiry,
    })

    this.notifyListeners('login', user)
  }

  /**
   * Logout
   */
  async logout() {
    // Call backend to invalidate token
    if (this.token && !this.user?.isTemp) {
      try {
        await fetch(`${env.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }

    // Clear local state
    this.user = null
    this.token = null
    this.tokenExpiry = null
    this.clearStorage()

    this.notifyListeners('logout')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user && !this.isTokenExpired()
  }

  /**
   * Check if token is expired
   */
  isTokenExpired() {
    if (!this.tokenExpiry) return true
    return Date.now() >= this.tokenExpiry
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user
  }

  /**
   * Get auth token
   */
  getToken() {
    return this.token
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    if (!this.user) return false
    return this.user.role === role
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.hasRole('admin')
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(callback) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  /**
   * Notify listeners of auth state changes
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => callback(event, data))
  }

  /**
   * Save auth data to localStorage
   */
  saveToStorage(data) {
    try {
      localStorage.setItem('ziner_auth', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save auth to storage:', error)
    }
  }

  /**
   * Load auth data from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('ziner_auth')
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load auth from storage:', error)
      return null
    }
  }

  /**
   * Clear auth data from localStorage
   */
  clearStorage() {
    try {
      localStorage.removeItem('ziner_auth')
    } catch (error) {
      console.error('Failed to clear auth from storage:', error)
    }
  }

  /**
   * Load Google Identity Services library
   */
  async loadGoogleIdentity() {
    if (window.google?.accounts) {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
}

// Export singleton instance
export const authService = new AuthService()
