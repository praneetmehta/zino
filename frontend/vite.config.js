import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Log build mode for debugging
  console.log('🔨 Building in mode:', mode)
  
  // Use /zino/ base path only if VITE_USE_SUBPATH is true (for same-server deployment)
  // Otherwise use root path for separate frontend deployment
  const useSubpath = process.env.VITE_USE_SUBPATH === 'true'
  const basePath = useSubpath ? '/zino/' : '/'
  
  console.log('📂 Base path:', basePath)
  
  return {
    plugins: [vue()],
    base: basePath,
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
