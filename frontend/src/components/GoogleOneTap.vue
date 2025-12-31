<template>
  <!-- Component is invisible - Google renders the UI -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import env from '@/config/env.js'

const authStore = useAuthStore()

// Disable One Tap for localhost due to CORS issues
// Use traditional OAuth popup instead (via LoginModal)
const shouldShowOneTap = false // !authStore.isAuthenticated && !env.skipAuth && env.googleClientId

let googleOneTapInitialized = false

onMounted(() => {
  if (!shouldShowOneTap) return

  // Load Google Identity Services
  loadGoogleIdentityServices()
})

function loadGoogleIdentityServices() {
  // Check if already loaded
  if (window.google?.accounts?.id) {
    initializeOneTap()
    return
  }

  // Load the script
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = initializeOneTap
  document.head.appendChild(script)
}

function initializeOneTap() {
  if (googleOneTapInitialized || !window.google?.accounts?.id) return

  try {
    window.google.accounts.id.initialize({
      client_id: env.googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    })

    // Display the One Tap prompt
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason())
      } else if (notification.isSkippedMoment()) {
        console.log('One Tap skipped:', notification.getSkippedReason())
      } else if (notification.isDismissedMoment()) {
        console.log('One Tap dismissed:', notification.getDismissedReason())
      }
    })

    googleOneTapInitialized = true
  } catch (error) {
    console.error('Failed to initialize Google One Tap:', error)
  }
}

async function handleCredentialResponse(response) {
  try {
    console.log('Google One Tap: Credential received')
    
    // The response contains a JWT credential (ID token)
    // We need to send this to our backend
    const result = await fetch(`${env.apiUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        credential: response.credential,
      }),
    })

    if (!result.ok) {
      throw new Error('Failed to authenticate')
    }

    const data = await result.json()
    
    // Import AuthService to set session properly
    const { authService } = await import('@/services/auth/AuthService.js')
    
    // Set session in auth service (this will trigger store updates)
    authService.setSession(data.user, data.token, data.expiresIn)

    console.log('✅ Signed in via Google One Tap:', data.user.name)
    
    // Refresh page to update UI (or emit event to parent)
    setTimeout(() => window.location.reload(), 500)
  } catch (error) {
    console.error('Google One Tap authentication failed:', error)
  }
}

onUnmounted(() => {
  // Cancel One Tap if navigating away
  if (window.google?.accounts?.id) {
    window.google.accounts.id.cancel()
  }
})
</script>
