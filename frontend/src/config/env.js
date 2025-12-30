/**
 * Environment Configuration
 * Centralized access to environment variables with defaults
 */

export const env = {
  // App
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: import.meta.env.VITE_APP_NAME || 'Ziner',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  // API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4876',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Authentication
  skipAuth: import.meta.env.VITE_SKIP_AUTH === 'true',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  googleRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${import.meta.env.VITE_APP_URL}/auth/callback`,
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 1 hour

  // Feature flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  maxUploadSize: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 10485760, // 10MB

  // Helper methods
  isDevelopment() {
    return this.appEnv === 'development'
  },

  isProduction() {
    return this.appEnv === 'production'
  },

  isAuthRequired() {
    return !this.skipAuth
  },

  log(message, ...args) {
    if (this.enableDebug) {
      console.log(`[${this.appName}]`, message, ...args)
    }
  },

  error(message, ...args) {
    console.error(`[${this.appName}]`, message, ...args)
  },
}

// Log configuration on load (development only)
if (env.isDevelopment()) {
  console.log('🔧 Environment Configuration:', {
    env: env.appEnv,
    apiUrl: env.apiUrl,
    storage: env.storageProvider,
    auth: env.isAuthRequired() ? 'required' : 'skipped',
  })
}

export default env
