import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Log build mode for debugging
  console.log('🔨 Building in mode:', mode)
  
  return {
    plugins: [vue()],
    base: '/zino/', // Serve app from /zino path
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000
    },
    // Ensure production mode is used for builds
    mode: mode || 'production',
    // Preview server config (for Railway's vite preview command)
    preview: {
      port: process.env.PORT || 4173,
      host: '0.0.0.0', // Required for Railway
    }
  }
})
