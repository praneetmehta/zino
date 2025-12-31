<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <button class="close-btn" @click="$emit('close')">✕</button>
      
      <h2>Welcome to Zino</h2>
      <p class="subtitle">Sign in to save your work and access it anywhere</p>

      <div class="login-options">
        <!-- Google Login Button -->
        <button class="google-btn" @click="handleGoogleLogin" :disabled="loading">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span v-if="!loading">{{ isDev ? 'Sign in with Test Account' : 'Sign in with Google' }}</span>
          <span v-else>Signing in...</span>
        </button>

        <!-- Dev Mode Info -->
        <div v-if="isDev" class="dev-info">
          <p>🔧 Development Mode</p>
          <p class="small">Using test account with mock data</p>
        </div>

        <!-- Features List -->
        <div class="features">
          <h3>What you get:</h3>
          <ul>
            <li>💾 Save your zines to the cloud</li>
            <li>🔄 Access from any device</li>
            <li>📚 Unlimited projects</li>
            <li>🎨 All layouts and features</li>
          </ul>
        </div>
      </div>

      <p class="privacy">
        By signing in, you agree to our 
        <a href="#">Terms of Service</a> and 
        <a href="#">Privacy Policy</a>
      </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import env from '@/config/env.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const loading = ref(false)
const isDev = computed(() => env.isDevelopment())

async function handleGoogleLogin() {
  try {
    loading.value = true
    console.log('🔐 Starting Google login...')
    
    if (env.skipAuth) {
      // Development mode: Use mock login
      await mockGoogleLogin()
    } else {
      // Production mode: Real Google OAuth
      const result = await authStore.loginWithGoogle()
      console.log('✅ Login successful:', result)
    }
    
    console.log('Closing modal and refreshing UI...')
    emit('close')
    
    // Force UI refresh
    setTimeout(() => {
      window.location.reload()
    }, 500)
  } catch (error) {
    console.error('❌ Login failed:', error)
    alert(`Login failed: ${error.message}\n\nCheck browser console for details.`)
  } finally {
    loading.value = false
  }
}

async function mockGoogleLogin() {
  // Simulate Google OAuth delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Create mock user
  await authStore.loginAsTemp()
  
  console.log('✅ Logged in with test account')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--panel-bg);
  border-radius: 20px;
  padding: 48px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--muted);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border);
  color: var(--text);
}

h2 {
  margin-bottom: 8px;
  color: var(--text-strong);
  font-size: 28px;
  font-weight: 700;
  text-align: center;
}

.subtitle {
  margin-bottom: 32px;
  color: var(--text-muted);
  text-align: center;
  font-size: 15px;
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.google-btn:hover:not(:disabled) {
  background: #f8f8f8;
  border-color: #d0d0d0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 24px;
  height: 24px;
}

.dev-info {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.dev-info p {
  margin: 4px 0;
  color: var(--text);
}

.dev-info .small {
  font-size: 13px;
  color: var(--text-muted);
}

.features {
  background: var(--muted);
  border-radius: 12px;
  padding: 20px;
}

.features h3 {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  margin-bottom: 8px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.privacy {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.privacy a {
  color: var(--accent);
  text-decoration: none;
}

.privacy a:hover {
  text-decoration: underline;
}
</style>
