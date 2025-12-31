<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>📚 Published Zines</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your publications...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn btn-outline" @click="loadPublications">Retry</button>
      </div>

      <div v-else-if="publications.length === 0" class="empty-state">
        <div class="empty-icon">📖</div>
        <h3>No published zines yet</h3>
        <p>Publish your first zine to see it here!</p>
        <button class="btn btn-primary" @click="$emit('close')">Create Zine</button>
      </div>

      <div v-else class="publications-list">
        <div
          v-for="pub in publications"
          :key="pub.id"
          class="publication-card"
        >
          <div class="pub-icon">📄</div>
          <div class="pub-info">
            <h3>{{ pub.title }}</h3>
            <div class="pub-meta">
              <span>{{ pub.pageCount }} pages</span>
              <span>•</span>
              <span>{{ formatSize(pub.size) }}</span>
              <span>•</span>
              <span>{{ formatDate(pub.publishedAt) }}</span>
            </div>
            <div class="pub-stats">
              <span>📥 {{ pub.downloadCount }} downloads</span>
            </div>
          </div>
          <div class="pub-actions">
            <button
              class="btn btn-outline btn-sm"
              @click="downloadPublication(pub)"
              :disabled="downloading === pub.id"
            >
              <span v-if="downloading === pub.id">⏳</span>
              <span v-else>📥 Download</span>
            </button>
            <button
              class="btn btn-primary btn-sm"
              @click="orderPrint(pub)"
            >
              🖨️ Order Print
            </button>
            <button
              class="btn btn-outline btn-sm btn-danger"
              @click="deletePublication(pub)"
              :disabled="deleting === pub.id"
            >
              <span v-if="deleting === pub.id">⏳</span>
              <span v-else>🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import download from 'downloadjs'
import { useAuthStore } from '@/stores/authStore'
import { env } from '@/config/env'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'order-print'])

const authStore = useAuthStore()
const API_BASE_URL = env.apiUrl

const publications = ref([])
const loading = ref(false)
const error = ref(null)
const downloading = ref(null)
const deleting = ref(null)

// Load publications when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadPublications()
  }
})

async function loadPublications() {
  try {
    loading.value = true
    error.value = null

    const response = await axios.get(`${API_BASE_URL}/api/published`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    publications.value = response.data.publications
    console.log('✅ Loaded publications:', publications.value.length)
  } catch (err) {
    console.error('Failed to load publications:', err)
    error.value = err.response?.data?.error || 'Failed to load publications'
  } finally {
    loading.value = false
  }
}

async function downloadPublication(pub) {
  try {
    downloading.value = pub.id
    console.log('Downloading from URL:', pub.url)

    // Fetch the PDF directly from the static URL
    const response = await fetch(pub.url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('Downloaded blob size:', blob.size)
    
    // Use downloadjs to trigger download
    download(blob, `${pub.title}.pdf`, 'application/pdf')

    console.log('✅ Downloaded:', pub.title)
  } catch (err) {
    console.error('Download failed:', err)
    error.value = 'Failed to download publication'
  } finally {
    downloading.value = null
  }
}
function orderPrint(pub) {
  emit('order-print', pub)
}

async function deletePublication(pub) {
  if (!confirm(`Are you sure you want to delete "${pub.title}"?`)) {
    return
  }

  try {
    deleting.value = pub.id

    await axios.delete(`${API_BASE_URL}/api/published/${pub.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    console.log('🗑️ Deleted:', pub.title)
    
    // Remove from list
    publications.value = publications.value.filter(p => p.id !== pub.id)
  } catch (err) {
    console.error('Failed to delete:', err)
    alert('Failed to delete publication')
  } finally {
    deleting.value = null
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.round(diffMs / 60000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--panel-bg);
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  animation: modalSlideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-strong);
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--muted);
  color: var(--text);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border);
  transform: scale(1.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 24px;
}

.publications-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.publication-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--muted);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.publication-card:hover {
  background: var(--panel-bg);
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pub-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel-bg);
  border-radius: 12px;
  flex-shrink: 0;
}

.pub-info {
  flex: 1;
  min-width: 0;
}

.pub-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pub-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.pub-stats {
  font-size: 12px;
  color: var(--text-muted);
}

.pub-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
