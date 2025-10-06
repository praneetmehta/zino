<template>
  <div class="layout-library">
    <div class="library-header">
      <button class="back-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </button>
      <h1>Layout Library</h1>
      <button class="create-btn" @click="$emit('open-builder')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Create New
      </button>
    </div>

    <div class="library-content">
      <!-- Sidebar - Categories -->
      <div class="categories-sidebar">
        <div class="sidebar-section">
          <label class="section-label">Filter</label>
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search layouts..." />
          </div>
        </div>

        <div class="sidebar-section">
          <label class="section-label">Categories</label>
          <div class="category-list">
            <button
              v-for="(category, key) in categories"
              :key="key"
              class="category-item"
              :class="{ active: selectedCategory === key }"
              @click="selectedCategory = key"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.layouts.length }}</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <label class="section-label">Status</label>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="showEnabled" />
              <span>Show Enabled</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="showDisabled" />
              <span>Show Disabled</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Main Content - Layout Grid -->
      <div class="layouts-grid-container">
        <div class="grid-header">
          <div class="grid-info">
            <h2>{{ categories[selectedCategory]?.name || 'All Layouts' }}</h2>
            <p>{{ filteredLayouts.length }} layouts</p>
          </div>
          <div class="grid-actions">
            <button 
              class="action-btn" 
              @click="enableAll"
              :disabled="filteredLayouts.every(l => isEnabled(l.id))"
            >
              Enable All
            </button>
            <button 
              class="action-btn secondary" 
              @click="disableAll"
              :disabled="filteredLayouts.every(l => !isEnabled(l.id))"
            >
              Disable All
            </button>
          </div>
        </div>

        <div class="layouts-grid">
          <div
            v-for="layout in filteredLayouts"
            :key="layout.id"
            class="layout-card"
            :class="{ 
              enabled: isEnabled(layout.id),
              custom: layout.category === 'custom'
            }"
          >
            <div class="layout-preview">
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <!-- Rectangle slots (including those without shape property) -->
                <rect
                  v-for="(slot, index) in (layout.slots || []).filter(s => !s.shape || s.shape === 'rectangle')"
                  :key="`rect-${index}`"
                  :x="slot.x || 0"
                  :y="slot.y || 0"
                  :width="slot.width || 100"
                  :height="slot.height || 100"
                  fill="rgba(99, 102, 241, 0.2)"
                  stroke="#6366f1"
                  stroke-width="0.5"
                />
                <!-- Polygon slots -->
                <polygon
                  v-for="(slot, index) in (layout.slots || []).filter(s => s.shape === 'polygon')"
                  :key="`poly-${index}`"
                  :points="slot.points.map(p => `${p.x},${p.y}`).join(' ')"
                  fill="rgba(99, 102, 241, 0.2)"
                  stroke="#6366f1"
                  stroke-width="0.5"
                />
                <!-- Text overlays -->
                <rect
                  v-for="(text, index) in (layout.textElements || [])"
                  :key="`text-${index}`"
                  :x="text.x || 0"
                  :y="text.y || 0"
                  :width="text.width || 20"
                  :height="text.height || 10"
                  fill="rgba(0, 0, 0, 0.1)"
                  stroke="rgba(0, 0, 0, 0.3)"
                  stroke-width="0.5"
                />
              </svg>
            </div>
            
            <div class="layout-info">
              <h3>{{ layout.name }}</h3>
              <div class="layout-meta">
                <span class="meta-badge">{{ layout.slots?.length || 0 }} slots</span>
                <span v-if="layout.category === 'custom'" class="meta-badge custom">Custom</span>
              </div>
            </div>

            <div class="layout-actions">
              <button
                class="toggle-btn"
                :class="{ enabled: isEnabled(layout.id) }"
                @click="toggleLayout(layout.id)"
              >
                <svg v-if="isEnabled(layout.id)" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ isEnabled(layout.id) ? 'Enabled' : 'Enable' }}
              </button>
              
              <button 
                v-if="layout.category === 'custom'" 
                class="icon-btn delete"
                @click="deleteLayout(layout.id)"
                title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { layoutDefinitions, layoutCategories } from '../layouts/layoutLoader'

const emit = defineEmits(['close', 'open-builder'])

const searchQuery = ref('')
const selectedCategory = ref('basic')
const showEnabled = ref(true)
const showDisabled = ref(true)
const enabledLayouts = ref(new Set())

// Load custom layouts from server
const customLayouts = ref([])

onMounted(() => {
  loadCustomLayouts()
  loadEnabledLayouts()
})

const loadCustomLayouts = async () => {
  try {
    const response = await fetch('http://localhost:4876/layouts/custom')
    if (response.ok) {
      const data = await response.json()
      customLayouts.value = data.layouts || []
    }
  } catch (error) {
    console.error('Failed to load custom layouts:', error)
    customLayouts.value = []
  }
}

const loadEnabledLayouts = () => {
  const stored = localStorage.getItem('enabledLayouts')
  if (stored) {
    enabledLayouts.value = new Set(JSON.parse(stored))
  } else {
    // By default, enable all built-in layouts
    layoutDefinitions.forEach(layout => {
      enabledLayouts.value.add(layout.id)
    })
    saveEnabledLayouts()
  }
}

const saveEnabledLayouts = () => {
  localStorage.setItem('enabledLayouts', JSON.stringify([...enabledLayouts.value]))
}

// Combine built-in and custom layouts
const categories = computed(() => {
  const cats = {}
  
  // Map layout IDs to full layout objects for built-in categories
  Object.keys(layoutCategories).forEach(key => {
    cats[key] = {
      ...layoutCategories[key],
      layouts: layoutCategories[key].layouts
        .map(layoutId => layoutDefinitions.find(l => l.id === layoutId))
        .filter(Boolean)
    }
  })
  
  // Add custom category
  cats.custom = {
    name: 'Custom',
    icon: '⭐',
    layouts: customLayouts.value
  }
  
  return cats
})

const allLayouts = computed(() => {
  return [...layoutDefinitions, ...customLayouts.value]
})

const filteredLayouts = computed(() => {
  let layouts = selectedCategory.value === 'all' 
    ? allLayouts.value 
    : categories.value[selectedCategory.value]?.layouts || []
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    layouts = layouts.filter(l => l.name.toLowerCase().includes(query))
  }
  
  // Filter by enabled/disabled
  if (!showEnabled.value) {
    layouts = layouts.filter(l => !isEnabled(l.id))
  }
  if (!showDisabled.value) {
    layouts = layouts.filter(l => isEnabled(l.id))
  }
  
  return layouts
})

const isEnabled = (layoutId) => {
  return enabledLayouts.value.has(layoutId)
}

const toggleLayout = (layoutId) => {
  if (enabledLayouts.value.has(layoutId)) {
    enabledLayouts.value.delete(layoutId)
  } else {
    enabledLayouts.value.add(layoutId)
  }
  saveEnabledLayouts()
}

const enableAll = () => {
  filteredLayouts.value.forEach(layout => {
    enabledLayouts.value.add(layout.id)
  })
  saveEnabledLayouts()
}

const disableAll = () => {
  filteredLayouts.value.forEach(layout => {
    enabledLayouts.value.delete(layout.id)
  })
  saveEnabledLayouts()
}

const deleteLayout = async (layoutId) => {
  if (confirm('Delete this custom layout?')) {
    try {
      const response = await fetch(`http://localhost:4876/layouts/custom/${layoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete layout')
      }

      // Remove from local state
      customLayouts.value = customLayouts.value.filter(l => l.id !== layoutId)
      enabledLayouts.value.delete(layoutId)
      saveEnabledLayouts()
    } catch (error) {
      console.error('Failed to delete layout:', error)
      alert('Failed to delete layout. Please try again.')
    }
  }
}
</script>

<style scoped>
.layout-library {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.library-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--panel-bg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
  font-weight: 500;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
}

.library-header h1 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: var(--accent-strong);
  transform: translateY(-1px);
}

.library-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.categories-sidebar {
  width: 250px;
  background: var(--panel-bg);
  border-right: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: var(--accent);
}

.search-box svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 14px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
  text-align: left;
  transition: all 0.2s;
}

.category-item:hover {
  background: var(--muted);
  border-color: var(--border);
}

.category-item.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.category-icon {
  font-size: 18px;
}

.category-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.category-count {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent);
}

.toggle-item span {
  font-size: 13px;
  color: var(--text);
}

.layouts-grid-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 4px 0;
}

.grid-info p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.grid-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: var(--accent-strong);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--muted);
  border-color: var(--accent);
}

.layouts-grid {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  align-content: start;
}

.layout-card {
  background: var(--panel-bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.layout-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.layout-card.enabled {
  border-color: var(--accent);
  background: var(--panel-bg-solid);
}

.layout-preview {
  aspect-ratio: 1;
  background: white;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.layout-preview svg {
  width: 100%;
  height: 100%;
}

.layout-info {
  padding: 16px;
  flex: 1;
}

.layout-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0 0 8px 0;
}

.layout-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 4px 8px;
  background: var(--muted);
  color: var(--text-muted);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.meta-badge.custom {
  background: var(--accent);
  color: white;
}

.layout-actions {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
}

.toggle-btn.enabled {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.icon-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--muted);
  color: var(--text);
}

.icon-btn.delete:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: white;
}
</style>
