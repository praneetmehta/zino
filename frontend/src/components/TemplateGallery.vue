<template>
  <div class="template-gallery-modal" @click.self="$emit('close')">
    <div class="gallery-container">
      <div class="gallery-header">
        <h2>{{ mode === 'book' ? '📚 Book Templates' : '🎨 Cover Templates' }}</h2>
        <p class="subtitle">
          {{ mode === 'book' 
            ? 'Start with a pre-designed book template' 
            : 'Apply a professional cover design to your book' 
          }}
        </p>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Category Filter -->
      <div class="filter-bar">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="templates-grid" v-if="!loading">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template)"
        >
          <div class="template-thumbnail">
            <img v-if="template.thumbnail" :src="template.thumbnail" :alt="template.name" />
            <div v-else class="placeholder-thumbnail">
              {{ mode === 'book' ? '📖' : '🎨' }}
            </div>
            <div class="template-overlay">
              <button class="preview-btn">
                {{ mode === 'book' ? 'Use Template' : 'Apply Cover' }}
              </button>
            </div>
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
            <div class="template-meta">
              <span v-if="mode === 'book'" class="meta-item">
                📄 {{ template.pageCount }} pages
              </span>
              <span v-if="template.category" class="meta-item category-badge">
                {{ template.category }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredTemplates.length === 0" class="empty-state">
          <p>No templates found in this category</p>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Loading templates...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotification } from '../composables/useNotification'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['book', 'cover'].includes(value)
  },
  bookId: String // Required for cover mode
})

const emit = defineEmits(['close', 'template-selected'])

const { toast } = useNotification()
const templates = ref([])
const loading = ref(true)
const selectedCategory = ref('all')

const categories = computed(() => {
  if (props.mode === 'book') {
    return [
      { id: 'all', name: 'All', icon: '📚' },
      { id: 'travel', name: 'Travel', icon: '✈️' },
      { id: 'wedding', name: 'Wedding', icon: '💒' },
      { id: 'baby', name: 'Baby', icon: '👶' },
      { id: 'yearbook', name: 'Yearbook', icon: '🎓' },
      { id: 'portfolio', name: 'Portfolio', icon: '💼' }
    ]
  } else {
    return [
      { id: 'all', name: 'All', icon: '🎨' },
      { id: 'minimal', name: 'Minimal', icon: '⬜' },
      { id: 'elegant', name: 'Elegant', icon: '✨' },
      { id: 'bold', name: 'Bold', icon: '💥' },
      { id: 'vintage', name: 'Vintage', icon: '📜' }
    ]
  }
})

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') {
    return templates.value
  }
  return templates.value.filter(t => t.category === selectedCategory.value)
})

onMounted(async () => {
  await fetchTemplates()
})

async function fetchTemplates() {
  try {
    loading.value = true
    const endpoint = props.mode === 'book' ? '/api/templates/books' : '/api/templates/covers'
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`)
    
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
    if (props.mode === 'book') {
      // Clone book template
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please sign in to use templates', 'Authentication Required')
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/books/${template.id}/clone`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to clone template')

      const data = await response.json()
      toast.success(`Created "${data.book.name}"`, 'Template Cloned')
      emit('template-selected', { type: 'book', data: data.book })
      emit('close')
    } else {
      // Apply cover template
      if (!props.bookId) {
        toast.error('No book selected', 'Error')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please sign in to apply covers', 'Authentication Required')
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/templates/covers/${template.id}/apply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ bookId: props.bookId })
        }
      )

      if (!response.ok) throw new Error('Failed to apply cover')

      const data = await response.json()
      toast.success('Cover template applied', 'Success')
      emit('template-selected', { type: 'cover', data: data.book })
      emit('close')
    }
  } catch (error) {
    console.error('Error selecting template:', error)
    toast.error('Failed to apply template', 'Error')
  }
}
</script>

<style scoped>
.template-gallery-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.gallery-container {
  background: var(--panel-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.gallery-header {
  padding: 32px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.gallery-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.close-btn {
  position: absolute;
  top: 32px;
  right: 32px;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--muted);
}

.filter-bar {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--accent);
  background: var(--muted);
}

.filter-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.templates-grid {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  align-content: start;
}

.template-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-color: var(--accent);
}

.template-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  background: var(--muted);
  overflow: hidden;
}

.template-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.template-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.template-card:hover .template-overlay {
  opacity: 1;
}

.preview-btn {
  padding: 12px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:hover {
  transform: scale(1.05);
}

.template-info {
  padding: 20px;
}

.template-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.template-info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.template-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 8px;
  background: var(--muted);
  border-radius: 4px;
}

.category-badge {
  background: var(--accent);
  color: white;
}

.empty-state,
.loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
