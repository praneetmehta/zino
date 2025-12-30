import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth/AuthService.js'
import env from '@/config/env.js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => authService.isAuthenticated())
  const isAdmin = computed(() => authService.isAdmin())
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.name || 'Guest')
  const userEmail = computed(() => user.value?.email || '')
  const isTemp = computed(() => user.value?.isTemp || false)

  // Actions
  async function init() {
    if (isInitialized.value) return

    try {
      isLoading.value = true
      await authService.init()
      user.value = authService.getUser()

      isInitialized.value = true
      env.log('Auth store initialized', { user: user.value?.email })
    } catch (err) {
      error.value = err.message
      env.error('Auth initialization failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle() {
    try {
      isLoading.value = true
      error.value = null

      const result = await authService.loginWithGoogle()
      user.value = result.user

      env.log('User logged in:', user.value.email)
      return result
    } catch (err) {
      error.value = err.message
      env.error('Login failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loginAsTemp() {
    try {
      isLoading.value = true
      error.value = null

      await authService.loginAsTemp()
      user.value = authService.getUser()

      env.log('Logged in as temp user')
    } catch (err) {
      error.value = err.message
      env.error('Temp login failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      isLoading.value = true
      error.value = null

      await authService.logout()
      user.value = null

      env.log('User logged out')
    } catch (err) {
      error.value = err.message
      env.error('Logout failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function hasRole(role) {
    return authService.hasRole(role)
  }

  function requireAuth() {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required')
    }
  }

  function requireAdmin() {
    requireAuth()
    if (!isAdmin.value) {
      throw new Error('Admin access required')
    }
  }

  // Subscribe to auth service events
  authService.subscribe((event, data) => {
    if (event === 'login') {
      user.value = data
    } else if (event === 'logout') {
      user.value = null
    }
  })

  return {
    // State
    user,
    isInitialized,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,
    userRole,
    userName,
    userEmail,
    isTemp,

    // Actions
    init,
    loginWithGoogle,
    loginAsTemp,
    logout,
    hasRole,
    requireAuth,
    requireAdmin,
  }
})
