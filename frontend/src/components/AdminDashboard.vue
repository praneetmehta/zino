<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>⚡ Admin Dashboard</h1>
      <button class="btn btn-ghost" @click="$emit('close')">Close</button>
    </div>

    <div class="dashboard-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="dashboard-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-value">{{ stats.overview?.totalBooks || 0 }}</div>
            <div class="stat-label">Total Books</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-value">{{ stats.overview?.totalTemplates || 0 }}</div>
            <div class="stat-label">Templates</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🖼️</div>
            <div class="stat-value">{{ stats.overview?.totalUploads || 0 }}</div>
            <div class="stat-label">Uploads</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ stats.overview?.totalUsers || 0 }}</div>
            <div class="stat-label">Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛒</div>
            <div class="stat-value">{{ stats.overview?.totalOrders || 0 }}</div>
            <div class="stat-label">Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-value">{{ stats.overview?.storageUsed || '0 MB' }}</div>
            <div class="stat-label">Storage Used</div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3>Books Created Over Time</h3>
            <div class="chart-placeholder">
              <div v-if="Object.keys(stats.booksByDate || {}).length === 0" class="empty-chart">
                No data available
              </div>
              <div v-else class="simple-bar-chart">
                <div 
                  v-for="(count, date) in stats.booksByDate" 
                  :key="date"
                  class="bar-item"
                >
                  <div class="bar" :style="{ height: `${(count / maxBooksPerDay) * 100}%` }"></div>
                  <div class="bar-label">{{ formatDate(date) }}</div>
                  <div class="bar-value">{{ count }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3>Storage Breakdown</h3>
            <div class="storage-breakdown">
              <div class="storage-item">
                <span class="storage-label">📚 Books</span>
                <span class="storage-value">{{ stats.storage?.books || '0 MB' }}</span>
              </div>
              <div class="storage-item">
                <span class="storage-label">🖼️ Uploads</span>
                <span class="storage-value">{{ stats.storage?.uploads || '0 MB' }}</span>
              </div>
              <div class="storage-item">
                <span class="storage-label">📄 Templates</span>
                <span class="storage-value">{{ stats.storage?.templates || '0 MB' }}</span>
              </div>
              <div class="storage-item total">
                <span class="storage-label">💾 Total</span>
                <span class="storage-value">{{ stats.storage?.total || '0 MB' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="recent-section">
          <h3>Recent Books</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User ID</th>
                  <th>Pages</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in stats.recentBooks" :key="book.id">
                  <td>{{ book.title }}</td>
                  <td><code>{{ book.userId || 'N/A' }}</code></td>
                  <td>{{ book.pageCount }}</td>
                  <td>{{ formatDateTime(book.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Books Tab -->
      <div v-if="activeTab === 'books'" class="tab-content">
        <div class="content-header">
          <h2>All Books ({{ books.length }})</h2>
          <button class="btn btn-outline" @click="loadBooks">
            <span>🔄</span> Refresh
          </button>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Pages</th>
                <th>Size</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.id">
                <td><code class="id-code">{{ book.id }}</code></td>
                <td>{{ book.title }}</td>
                <td><code>{{ book.userId || 'N/A' }}</code></td>
                <td>{{ book.metadata?.pageCount || 0 }}</td>
                <td>{{ book.fileSize }}</td>
                <td>{{ formatDateTime(book.createdAt) }}</td>
                <td>
                  <button 
                    class="btn-icon btn-danger" 
                    @click="deleteBook(book.id)"
                    title="Delete book"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Templates Tab -->
      <div v-if="activeTab === 'templates'" class="tab-content">
        <div class="content-header">
          <h2>All Templates ({{ templates.length }})</h2>
          <button class="btn btn-outline" @click="loadTemplates">
            <span>🔄</span> Refresh
          </button>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Size</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="template in templates" :key="template.id">
                <td><code class="id-code">{{ template.id }}</code></td>
                <td>{{ template.name }}</td>
                <td><span class="badge">{{ template.category }}</span></td>
                <td>${{ template.price || 0 }}</td>
                <td>{{ template.fileSize }}</td>
                <td>{{ formatDateTime(template.metadata?.createdAt) }}</td>
                <td>
                  <button 
                    class="btn-icon btn-danger" 
                    @click="deleteTemplate(template.id)"
                    title="Delete template"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Uploads Tab -->
      <div v-if="activeTab === 'uploads'" class="tab-content">
        <div class="content-header">
          <h2>Uploaded Files ({{ uploads.length }})</h2>
          <button class="btn btn-outline" @click="loadUploads">
            <span>🔄</span> Refresh
          </button>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="upload in uploads" :key="upload.name">
                <td><code>{{ upload.name }}</code></td>
                <td>{{ upload.size }}</td>
                <td>{{ formatDateTime(upload.created) }}</td>
                <td>{{ formatDateTime(upload.modified) }}</td>
                <td>
                  <button 
                    class="btn-icon btn-danger" 
                    @click="deleteUpload(upload.name)"
                    title="Delete file"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Tab -->
      <div v-if="activeTab === 'system'" class="tab-content">
        <h2>System Information</h2>
        
        <div class="system-info">
          <div class="info-group">
            <h3>Environment</h3>
            <div class="info-item">
              <span class="info-label">Node Version:</span>
              <span class="info-value">{{ systemInfo.nodeVersion }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Platform:</span>
              <span class="info-value">{{ systemInfo.platform }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Environment:</span>
              <span class="info-value">{{ systemInfo.env }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Uptime:</span>
              <span class="info-value">{{ formatUptime(systemInfo.uptime) }}</span>
            </div>
          </div>

          <div class="info-group">
            <h3>Memory Usage</h3>
            <div class="info-item">
              <span class="info-label">Heap Total:</span>
              <span class="info-value">{{ systemInfo.memory?.total }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Heap Used:</span>
              <span class="info-value">{{ systemInfo.memory?.used }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">RSS:</span>
              <span class="info-value">{{ systemInfo.memory?.rss }}</span>
            </div>
          </div>

          <div class="info-group">
            <h3>Storage</h3>
            <div class="info-item">
              <span class="info-label">Volume Path:</span>
              <span class="info-value"><code>{{ systemInfo.volumePath }}</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '../composables/useNotification'

const { toast } = useNotification()

const activeTab = ref('overview')
const stats = ref({})
const books = ref([])
const templates = ref([])
const uploads = ref([])
const systemInfo = ref({})

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'templates', label: 'Templates', icon: '📄' },
  { id: 'uploads', label: 'Uploads', icon: '🖼️' },
  { id: 'system', label: 'System', icon: '⚙️' }
]

const maxBooksPerDay = computed(() => {
  const counts = Object.values(stats.value.booksByDate || {})
  return counts.length > 0 ? Math.max(...counts) : 1
})

async function loadStats() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load stats')
    
    stats.value = await response.json()
  } catch (error) {
    console.error('Error loading stats:', error)
    toast.error('Failed to load statistics')
  }
}

async function loadBooks() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/books`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load books')
    
    const data = await response.json()
    books.value = data.books
  } catch (error) {
    console.error('Error loading books:', error)
    toast.error('Failed to load books')
  }
}

async function loadTemplates() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load templates')
    
    const data = await response.json()
    templates.value = data.templates
  } catch (error) {
    console.error('Error loading templates:', error)
    toast.error('Failed to load templates')
  }
}

async function loadUploads() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/uploads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load uploads')
    
    const data = await response.json()
    uploads.value = data.uploads
  } catch (error) {
    console.error('Error loading uploads:', error)
    toast.error('Failed to load uploads')
  }
}

async function loadSystemInfo() {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/system`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to load system info')
    
    systemInfo.value = await response.json()
  } catch (error) {
    console.error('Error loading system info:', error)
    toast.error('Failed to load system info')
  }
}

async function deleteBook(id) {
  if (!confirm(`Delete book ${id}? This cannot be undone.`)) return
  
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/books/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to delete book')
    
    toast.success('Book deleted')
    loadBooks()
    loadStats()
  } catch (error) {
    console.error('Error deleting book:', error)
    toast.error('Failed to delete book')
  }
}

async function deleteTemplate(id) {
  if (!confirm(`Delete template ${id}? This cannot be undone.`)) return
  
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to delete template')
    
    toast.success('Template deleted')
    loadTemplates()
    loadStats()
  } catch (error) {
    console.error('Error deleting template:', error)
    toast.error('Failed to delete template')
  }
}

async function deleteUpload(filename) {
  if (!confirm(`Delete ${filename}? This cannot be undone.`)) return
  
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/uploads/${filename}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) throw new Error('Failed to delete file')
    
    toast.success('File deleted')
    loadUploads()
    loadStats()
  } catch (error) {
    console.error('Error deleting file:', error)
    toast.error('Failed to delete file')
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatUptime(seconds) {
  if (!seconds) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

onMounted(() => {
  loadStats()
  loadBooks()
  loadTemplates()
  loadUploads()
  loadSystemInfo()
})
</script>

<style scoped>
.admin-dashboard {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-strong);
}

.dashboard-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 40px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-bg);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--muted);
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: var(--accent);
  background: var(--panel-bg);
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.tab-icon {
  font-size: 18px;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
}

.tab-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.chart-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-strong);
}

.simple-bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 20px 0;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s;
}

.bar-item:hover .bar {
  opacity: 0.8;
}

.bar-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
}

.storage-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--muted);
  border-radius: 8px;
}

.storage-item.total {
  background: var(--accent);
  color: white;
  font-weight: 600;
}

.storage-label {
  font-size: 14px;
}

.storage-value {
  font-size: 14px;
  font-weight: 600;
}

.recent-section {
  margin-top: 40px;
}

.recent-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-strong);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-strong);
}

.table-container {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--muted);
}

.data-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 16px;
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text);
}

.data-table tbody tr:hover {
  background: var(--muted);
}

.id-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  background: var(--muted);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--accent);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--accent);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--muted);
}

.btn-danger:hover {
  background: var(--danger);
}

.system-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.info-group {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.info-group h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-strong);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 600;
}

.info-value code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  background: var(--muted);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
