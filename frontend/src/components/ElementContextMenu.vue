<template>
  <transition name="slide-fade">
    <div v-if="isVisible && selectedElement" class="context-menu" :style="menuPosition" ref="contextMenuEl">
      <div class="menu-header" @mousedown="startDrag" style="cursor: move;">
        <div class="header-icon">{{ elementIcon }}</div>
        <h3>{{ elementTitle }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="menu-body">
        <!-- Layer Controls (for all elements) -->
        <div class="control-row">
          <button class="icon-btn" @click="$emit('bring-to-front')" title="Bring to Front">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L8 13M8 3L4 7M8 3L12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="icon-btn" @click="$emit('send-to-back')" title="Send to Back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 13L8 3M8 13L4 9M8 13L12 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button v-if="elementType === 'text'" class="icon-btn" @click="$emit('toggle-lock')" :title="selectedElement.locked ? 'Unlock' : 'Lock'">
            <svg v-if="selectedElement.locked" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="7" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 7V5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5V7" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="7" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 7V5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5V6" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button class="icon-btn danger" @click="$emit('delete')" title="Delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Image Slot Controls -->
        <template v-if="elementType === 'slot'">
          <div class="menu-divider"></div>
          
          <div class="menu-section">
            <label class="section-label">Image Fit</label>
            <div class="fit-toggle-group">
              <button 
                class="fit-btn" 
                :class="{ active: selectedElement.fit === 'cover' }"
                @click="$emit('toggle-fit')"
              >
                Cover
              </button>
              <button 
                class="fit-btn" 
                :class="{ active: selectedElement.fit === 'contain' }"
                @click="$emit('toggle-fit')"
              >
                Contain
              </button>
            </div>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-section">
            <label class="section-label">Background Color</label>
            <div class="color-control">
              <input 
                type="color" 
                :value="selectedElement.backgroundColor || '#ffffff'"
                @input="e => $emit('set-background-color', e.target.value)"
                class="color-picker"
              />
              <button 
                v-if="selectedElement.backgroundColor"
                class="clear-btn"
                @click="$emit('set-background-color', null)"
                title="Clear"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-section">
            <label class="section-label">Inner Margin</label>
            <div class="slider-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="selectedElement.innerMarginPx || 0"
                @input="e => $emit('set-inner-margin', e.target.value)"
                class="slider"
              />
              <span class="value">{{ Math.round(selectedElement.innerMarginPx || 0) }}px</span>
            </div>
          </div>
        </template>

        <!-- Text Element Controls -->
        <template v-if="elementType === 'text'">
          <div class="menu-divider"></div>
          
          <div class="menu-section">
            <label class="section-label">Font</label>
            <div class="custom-font-dropdown">
              <button 
                class="font-dropdown-trigger" 
                @click="fontDropdownOpen = !fontDropdownOpen"
                :style="{ fontFamily: selectedElement.style?.fontFamily || 'Inter' }"
              >
                {{ selectedElement.style?.fontFamily || 'Inter' }}
                <span class="dropdown-arrow">▼</span>
              </button>
              <div v-if="fontDropdownOpen" class="font-dropdown-menu" @mouseleave="fontDropdownOpen = false">
                <div v-for="category in fontCategories" :key="category.name" class="font-category">
                  <div class="category-label">{{ category.name }}</div>
                  <button
                    v-for="font in category.fonts"
                    :key="font"
                    class="font-option"
                    :class="{ active: (selectedElement.style?.fontFamily || 'Inter') === font }"
                    :style="{ fontFamily: font }"
                    @mouseenter="$emit('update-style', { fontFamily: font })"
                    @click="fontDropdownOpen = false"
                  >
                    {{ font }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="menu-section">
            <label class="section-label">Size & Weight</label>
            <div class="input-group">
              <input 
                type="number" 
                :value="selectedElement.style?.fontSize || 16"
                @input="e => $emit('update-style', { fontSize: Number(e.target.value) })"
                min="8" 
                max="200"
                class="number-input"
                placeholder="Size"
              />
              <select 
                :value="selectedElement.style?.fontWeight || 400"
                @change="e => $emit('update-style', { fontWeight: Number(e.target.value) })"
                class="select-input"
              >
                <option :value="300">Light</option>
                <option :value="400">Regular</option>
                <option :value="600">Semibold</option>
                <option :value="700">Bold</option>
              </select>
            </div>
          </div>

          <div class="menu-section">
            <label class="section-label">Alignment</label>
            <div class="align-group">
              <button 
                class="align-btn" 
                :class="{ active: selectedElement.style?.textAlign === 'left' }"
                @click="$emit('update-style', { textAlign: 'left' })"
              >
                ⬅
              </button>
              <button 
                class="align-btn" 
                :class="{ active: selectedElement.style?.textAlign === 'center' }"
                @click="$emit('update-style', { textAlign: 'center' })"
              >
                ↔
              </button>
              <button 
                class="align-btn" 
                :class="{ active: selectedElement.style?.textAlign === 'right' }"
                @click="$emit('update-style', { textAlign: 'right' })"
              >
                ⮕
              </button>
            </div>
          </div>

          <div class="menu-section">
            <label class="section-label">Colors</label>
            <div class="color-row">
              <div class="color-item">
                <label>Text</label>
                <input 
                  type="color" 
                  :value="selectedElement.style?.color || '#000000'"
                  @input="e => $emit('update-style', { color: e.target.value })"
                  class="color-picker-small"
                />
              </div>
              <div class="color-item">
                <label>Background</label>
                <input 
                  type="color" 
                  :value="selectedElement.style?.backgroundColor || 'transparent'"
                  @input="e => $emit('update-style', { backgroundColor: e.target.value })"
                  class="color-picker-small"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Lock/Unlock (for text elements) -->
        <template v-if="elementType === 'text'">
          <div class="menu-divider"></div>
          
          <div class="menu-section">
            <button class="lock-btn" @click="$emit('toggle-lock')">
              <span class="icon">{{ selectedElement.locked ? '🔒' : '🔓' }}</span>
              <span class="label">{{ selectedElement.locked ? 'Unlock' : 'Lock' }} Element</span>
            </button>
          </div>
        </template>

        <!-- Page Controls -->
        <template v-if="elementType === 'page'">
          <div class="menu-divider"></div>
          
          <div class="menu-section">
            <label class="section-label">Page Margin Override</label>
            <div class="margin-override">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :checked="selectedElement.marginOverride !== null"
                  @change="$emit('toggle-margin-override')"
                />
                <span>Use custom margin</span>
              </label>
              <div v-if="selectedElement.marginOverride !== null" class="margin-input-group">
                <input 
                  type="number"
                  :value="selectedElement.marginOverride"
                  @input="e => $emit('set-page-margin', parseFloat(e.target.value))"
                  min="0"
                  step="0.5"
                  class="number-input"
                />
                <span class="unit">{{ selectedElement.unit || 'mm' }}</span>
              </div>
              <small v-else class="hint">Using global margin</small>
            </div>
          </div>
        </template>

        <!-- Delete Button (for elements, not pages) -->
        <template v-if="elementType !== 'page'">
          <div class="menu-divider"></div>
          
          <div class="menu-section">
            <button class="delete-btn" @click="$emit('delete')">
              <span class="icon">🗑️</span>
              <span class="label">Delete Element</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  selectedElement: Object,
  elementType: String, // 'slot' or 'text'
  position: Object,
})

defineEmits([
  'close',
  'bring-to-front',
  'send-to-back',
  'toggle-fit',
  'set-background-color',
  'set-inner-margin',
  'update-style',
  'toggle-lock',
  'delete',
  'toggle-margin-override',
  'set-page-margin',
])

const elementTitle = computed(() => {
  if (props.elementType === 'slot') return 'Image Slot'
  if (props.elementType === 'text') return 'Text Element'
  if (props.elementType === 'page') return 'Page Settings'
  return 'Element'
})

const elementIcon = computed(() => {
  if (props.elementType === 'slot') return '🖼️'
  if (props.elementType === 'text') return '📝'
  if (props.elementType === 'page') return '📄'
  return '⚙️'
})

// Font dropdown state
const fontDropdownOpen = ref(false)
const fontCategories = [
  {
    name: 'Sans Serif',
    fonts: ['Inter', 'Roboto', 'Montserrat', 'Poppins', 'Raleway', 'Work Sans', 'DM Sans', 'Space Grotesk']
  },
  {
    name: 'Elegant Serif',
    fonts: ['Playfair Display', 'Bodoni Moda', 'Cormorant Garamond', 'EB Garamond', 'Cinzel', 'Spectral', 'Lora', 'Merriweather', 'Crimson Text', 'Libre Baskerville', 'Bitter']
  },
  {
    name: 'Bold & Impact',
    fonts: ['Bebas Neue', 'Anton', 'Archivo Black', 'Oswald', 'Staatliches', 'Righteous']
  },
  {
    name: 'Display & Editorial',
    fonts: ['Abril Fatface']
  }
]

// Draggable state
const contextMenuEl = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const savedPosition = ref(null)

// Load saved position from localStorage
onMounted(() => {
  const saved = localStorage.getItem('contextMenuPosition')
  if (saved) {
    try {
      savedPosition.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved position:', e)
    }
  }
})

const menuPosition = computed(() => {
  // Use saved position if available and valid
  if (savedPosition.value) {
    // Ensure position is visible (not behind sidebar)
    const minLeft = 320 // Account for left sidebar
    const left = Math.max(savedPosition.value.left, minLeft)
    
    return {
      left: `${left}px`,
      top: `${savedPosition.value.top}px`,
    }
  }
  
  // Otherwise use props position or default (fixed position from right)
  if (!props.position) return { right: '320px', top: '100px' }
  return {
    left: props.position.left,
    right: props.position.right,
    top: `${props.position.top || 100}px`,
  }
})

const startDrag = (e) => {
  if (!contextMenuEl.value) return
  
  isDragging.value = true
  const rect = contextMenuEl.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  if (!isDragging.value) return
  
  const newLeft = e.clientX - dragOffset.value.x
  const newTop = e.clientY - dragOffset.value.y
  
  // Keep within viewport bounds
  const maxLeft = window.innerWidth - 240 // menu width
  const maxTop = window.innerHeight - 100
  
  savedPosition.value = {
    left: Math.max(0, Math.min(newLeft, maxLeft)),
    top: Math.max(0, Math.min(newTop, maxTop))
  }
  
  // Save to localStorage
  localStorage.setItem('contextMenuPosition', JSON.stringify(savedPosition.value))
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-12px) scale(0.96);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px) scale(0.98);
}

.context-menu {
  position: fixed;
  width: 240px;
  max-height: calc(100vh - 120px);
  background: var(--panel-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  line-height: 1;
}

.menu-header h3 {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0;
  letter-spacing: -0.01em;
}

.close-btn {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: var(--muted);
  color: var(--text);
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.menu-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.control-row {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--muted);
  border-radius: 8px;
  margin-bottom: 8px;
}

.icon-btn {
  flex: 1;
  background: transparent;
  border: none;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.icon-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: var(--panel-bg-solid);
  opacity: 0;
  transition: opacity 0.15s;
}

.icon-btn:hover::before {
  opacity: 1;
}

.icon-btn:hover {
  color: var(--accent);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: translateY(0) scale(0.96);
}

.icon-btn.danger:hover {
  color: var(--danger);
}

.icon-btn svg {
  position: relative;
  z-index: 1;
}

.menu-section {
  margin-bottom: 12px;
  padding: 0 4px;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 4px;
  opacity: 0.5;
}

/* Layer Controls */
.layer-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.layer-btn {
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.layer-btn .icon {
  font-size: 16px;
}

.layer-btn .label {
  font-size: 13px;
  font-weight: 500;
}

/* Fit Toggle */
.fit-toggle-group {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--muted);
  border-radius: 7px;
}

.fit-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 5px;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text);
}

.fit-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.fit-btn.active {
  background: var(--panel-bg-solid);
  color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

/* Color Control */
.color-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  flex: 1;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.clear-btn {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--danger);
  border-color: var(--danger);
  color: white;
}

/* Slider Control */
.slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--muted);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.value {
  font-size: 13px;
  font-weight: 600;
}

/* Custom Font Dropdown */
.custom-font-dropdown {
  position: relative;
}

.font-dropdown-trigger {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.font-dropdown-trigger:hover {
  border-color: var(--accent);
}

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.5;
}

.font-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  padding: 8px;
}

.font-category {
  margin-bottom: 12px;
}

.font-category:last-child {
  margin-bottom: 0;
}

.category-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
  margin-bottom: 4px;
}

.font-option {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
  transition: all 0.15s;
  display: block;
}

.font-option:hover {
  background: var(--accent);
  color: white;
}

.font-option.active {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent);
  font-weight: 500;
}

/* Text Controls */
.select-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent);
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.number-input {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel-bg-solid);
  color: var(--text);
  font-size: 13px;
  transition: all 0.2s;
}

.number-input:focus {
  outline: none;
  border-color: var(--accent);
}

.align-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.align-btn {
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.align-btn:hover {
  background: var(--muted);
}

.align-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.color-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-item label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.color-picker-small {
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

/* Lock Button */
.lock-btn {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text);
  font-weight: 500;
  transition: all 0.2s;
}

.lock-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
}

.lock-btn .icon {
  font-size: 16px;
}

/* Delete Button */
.delete-btn {
  width: 100%;
  background: transparent;
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: var(--danger);
  font-weight: 500;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: var(--danger);
  color: white;
}

.delete-btn .icon {
  font-size: 16px;
}

/* Page Controls */
.margin-override {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.margin-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.margin-input-group .number-input {
  flex: 1;
}

.margin-input-group .unit {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  display: block;
  margin-top: 4px;
}
</style>
