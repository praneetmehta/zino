import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// Create and mount app
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize auth store after pinia is available
import { useAuthStore } from '@/stores/authStore'
app.mount('#app')

// Initialize auth after mount
const authStore = useAuthStore()
authStore.init().catch(error => {
  console.error('Auth initialization failed:', error)
})
