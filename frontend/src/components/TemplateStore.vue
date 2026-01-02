<template>
  <div class="template-store">
    <!-- Header -->
    <header class="store-header">
      <div class="header-content">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-text">
          <h1>📚 Template Store</h1>
          <p>Professional book templates to kickstart your project</p>
        </div>
      </div>
    </header>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-content">
        <div class="category-filters">
          <button 
            v-for="category in categories" 
            :key="category.id"
            class="category-btn"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
        
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="search-icon">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search templates..."
            class="search-input"
          />
        </div>
      </div>
    </div>

    <!-- Templates Grid -->
    <div class="store-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading templates...</p>
      </div>

      <div v-else-if="filteredTemplates.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No templates found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>

      <div v-else class="templates-grid">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="card-thumbnail">
            <img v-if="template.thumbnail" :src="template.thumbnail" :alt="template.name" />
            <div v-else class="placeholder-thumbnail">
              <span class="placeholder-icon">📖</span>
            </div>
            <div class="card-overlay">
              <button class="use-btn">Use Template</button>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ template.name }}</h3>
            <p class="card-description">{{ template.description }}</p>
            
            <div class="card-meta">
              <span class="meta-badge">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 3H12V11H2V3Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  <path d="M4 1V3M10 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                </svg>
                {{ template.pageCount }} pages
              </span>
              <span v-if="template.category" class="category-badge">
                {{ template.category }}
              </span>
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

const emit = defineEmits(['close', 'template-selected'])

const { toast } = useNotification()
const templates = ref([])
const loading = ref(true)
const selectedCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { id: 'all', name: 'All Templates', icon: '📚' },
  { id: 'photobook', name: 'Photobooks', icon: '📸' },
  { id: 'magazine', name: 'Magazines', icon: '📰' },
  { id: 'portfolio', name: 'Portfolios', icon: '🎨' },
  { id: 'catalog', name: 'Catalogs', icon: '📋' },
  { id: 'lookbook', name: 'Lookbooks', icon: '👗' },
  { id: 'cookbook', name: 'Cookbooks', icon: '🍳' }
]

const filteredTemplates = computed(() => {
  let filtered = templates.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const goBack = () => {
  window.history.back()
}

async function fetchTemplates() {
  try {
    loading.value = true
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/books`)
    
    if (!response.ok) throw new Error('Failed to fetch templates')
    
    const data = await response.json()
    templates.value = data.templates || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    toast.error('Failed to load templates', 'Error')
  } finally {
    loading.value = false
  }
}

async function selectTemplate(template) {
  try {
    // Fetch the template data to preview it
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/templates/books/${template.id}`
    )

    if (!response.ok) throw new Error('Failed to load template')

    const data = await response.json()
    
    // Emit template for preview (opens as demo book)
    emit('template-selected', { 
      type: 'preview',
      template: data.template,
      templateId: template.id,
      templateName: template.name
    })
  } catch (error) {
    console.error('Error loading template:', error)
    toast.error('Failed to load template', 'Error')
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.template-store {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

/* Header */
.store-header {
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border);
  padding: 24px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
}

.back-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
}

.header-text h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.header-text p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-muted);
}

/* Filter Bar */
.filter-bar {
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border);
  padding: 16px 0;
  position: sticky;
  top: 88px;
  z-index: 99;
  backdrop-filter: blur(10px);
}

.filter-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.category-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
}

.category-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.category-icon {
  font-size: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-width: 240px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Content */
.store-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 32px;
  width: 100%;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.template-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--accent);
}

.card-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--muted);
}

.card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.template-card:hover .card-thumbnail img {
  transform: scale(1.05);
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--muted) 0%, var(--border) 100%);
}

.placeholder-icon {
  font-size: 64px;
  opacity: 0.3;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.template-card:hover .card-overlay {
  opacity: 1;
}

.use-btn {
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.use-btn:hover {
  background: var(--accent-strong);
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--muted);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.meta-badge svg {
  opacity: 0.7;
}

.category-badge {
  padding: 4px 8px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
