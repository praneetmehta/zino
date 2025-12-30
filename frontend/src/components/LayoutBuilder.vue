<template>
  <div class="layout-builder">
    <div class="builder-header">
      <button class="back-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </button>
      <h1>Layout Builder</h1>
      <button class="save-btn" @click="saveLayout" :disabled="!layoutName.trim()">
        Save Layout
      </button>
    </div>

    <div class="builder-workspace">
      <!-- Left Panel - Controls -->
      <div class="controls-panel">
        <div class="control-section">
          <label class="section-label">Layout Name</label>
          <input 
            v-model="layoutName" 
            type="text" 
            placeholder="My Custom Layout"
            class="layout-name-input"
          />
        </div>

        <div class="control-section">
          <label class="section-label">Category</label>
          <select 
            v-if="isAdmin" 
            v-model="layoutCategory" 
            class="category-select"
          >
            <option value="basic">Basic</option>
            <option value="editorial">Editorial</option>
            <option value="portfolio">Portfolio</option>
            <option value="magazine">Magazine</option>
            <option value="custom">Custom</option>
          </select>
          <div v-else class="category-locked">
            <span class="category-badge">Custom</span>
            <span class="hint">Only admins can create layouts in other categories</span>
          </div>
        </div>

        <div class="control-section">
          <label class="section-label">Canvas Preview Size</label>
          <p class="hint">These dimensions are only for the builder preview. Your layout will work with any page size.</p>
          <div class="dimension-inputs">
            <div class="input-group">
              <label>Width (mm)</label>
              <input v-model.number="pageWidth" type="number" min="50" max="500" />
            </div>
            <div class="input-group">
              <label>Height (mm)</label>
              <input v-model.number="pageHeight" type="number" min="50" max="500" />
            </div>
          </div>
        </div>

        <div class="control-section">
          <label class="section-label">View Options</label>
          <div class="toggle-group">
            <label class="toggle-item">
              <input type="checkbox" v-model="showGrid" />
              <span>Show Grid</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="snapToGrid" />
              <span>Snap to Grid</span>
            </label>
            <label class="toggle-item">
              <input type="checkbox" v-model="snapToElements" />
              <span>Snap to Elements</span>
            </label>
          </div>
        </div>

        <div class="control-section">
          <label class="section-label">Add Elements</label>
          <div class="add-buttons">
            <button class="add-element-btn" @click="addSlot('rectangle')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              Rectangle
            </button>
            <button class="add-element-btn" @click="addPolygonSlot">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 5L8 2L13 6L11 13L5 12L3 5Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              Polygon
            </button>
            <button class="add-element-btn" @click="addTextOverlay">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 3H12M8 3V13M6 13H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Text
            </button>
          </div>
        </div>

        <div class="control-section" v-if="selectedSlotIndex !== null">
          <label class="section-label">Align</label>
          <div class="align-controls">
            <button class="align-btn" @click="alignLeft" title="Align Left">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2V14M5 5H14M5 8H12M5 11H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="align-btn" @click="alignCenter" title="Align Center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V14M4 5H12M5 8H11M4 11H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="align-btn" @click="alignRight" title="Align Right">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2V14M2 5H11M4 8H11M2 11H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="align-btn" @click="alignTop" title="Align Top">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2H14M5 5V14M8 5V12M11 5V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="align-btn" @click="alignMiddle" title="Align Middle">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8H14M5 4V12M8 5V11M11 4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="align-btn" @click="alignBottom" title="Align Bottom">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14H14M5 2V11M8 4V11M11 2V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="control-section" v-if="selectedSlotIndex !== null">
          <label class="section-label">Element Type</label>
          <div class="type-badge">
            {{ slots[selectedSlotIndex].type === 'text' ? 'Text Overlay' : slots[selectedSlotIndex].shape || 'Rectangle' }}
          </div>
        </div>

        <div class="control-section" v-if="selectedSlotIndex !== null && slots[selectedSlotIndex].type === 'text'">
          <label class="section-label">Text Content</label>
          <textarea 
            v-model="slots[selectedSlotIndex].content" 
            class="text-content-input"
            placeholder="Enter text..."
            rows="3"
          ></textarea>
          <div class="input-group">
            <label>Font Size (px)</label>
            <input v-model.number="slots[selectedSlotIndex].fontSize" type="number" min="8" max="200" />
          </div>
          <div class="input-group">
            <label>Color</label>
            <input v-model="slots[selectedSlotIndex].color" type="color" class="color-input" />
          </div>
        </div>

        <div class="control-section" v-if="selectedSlotIndex !== null">
          <label class="section-label">Position & Size</label>
          <div class="slot-controls">
            <div class="input-group">
              <label>X (%)</label>
              <input v-model.number="slots[selectedSlotIndex].x" type="number" min="0" max="100" step="0.1" />
            </div>
            <div class="input-group">
              <label>Y (%)</label>
              <input v-model.number="slots[selectedSlotIndex].y" type="number" min="0" max="100" step="0.1" />
            </div>
            <div class="input-group">
              <label>Width (%)</label>
              <input v-model.number="slots[selectedSlotIndex].width" type="number" min="1" max="100" step="0.1" />
            </div>
            <div class="input-group">
              <label>Height (%)</label>
              <input v-model.number="slots[selectedSlotIndex].height" type="number" min="1" max="100" step="0.1" />
            </div>
            <button class="delete-slot-btn" @click="deleteSlot(selectedSlotIndex)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Delete Element
            </button>
          </div>
        </div>

        <div class="slots-list">
          <label class="section-label">Slots ({{ slots.length }})</label>
          <div 
            v-for="(slot, index) in slots" 
            :key="index"
            class="slot-item"
            :class="{ active: selectedSlotIndex === index }"
            @click="selectedSlotIndex = index"
          >
            <span class="slot-number">{{ index + 1 }}</span>
            <span class="slot-info">{{ Math.round(slot.width) }}% × {{ Math.round(slot.height) }}%</span>
          </div>
        </div>
      </div>

      <!-- Center - Canvas Preview -->
      <div class="canvas-preview">
        <div class="preview-container">
          <div 
            class="preview-page" 
            :style="previewPageStyle"
            @click="deselectSlot"
          >
            <!-- Grid Lines -->
            <svg v-if="showGrid" class="grid-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              <!-- Major grid lines every 25% -->
              <line x1="25" y1="0" x2="25" y2="100" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" />
              <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(0,0,0,0.2)" stroke-width="0.5" />
            </svg>

            <!-- Snap Guides -->
            <svg v-if="snapGuides.length > 0" class="snap-guides" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line 
                v-for="(guide, index) in snapGuides" 
                :key="index"
                :x1="guide.type === 'vertical' ? guide.position : 0"
                :y1="guide.type === 'horizontal' ? guide.position : 0"
                :x2="guide.type === 'vertical' ? guide.position : 100"
                :y2="guide.type === 'horizontal' ? guide.position : 100"
                stroke="#6366f1"
                stroke-width="0.3"
                stroke-dasharray="2,2"
              />
            </svg>

            <!-- Polygon slots with SVG -->
            <svg 
              v-for="(slot, index) in slots.filter(s => s.shape === 'polygon')"
              :key="`poly-${index}`"
              class="polygon-slot"
              :class="{ selected: selectedSlotIndex === slots.indexOf(slot) }"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              @click.stop="selectSlot(slots.indexOf(slot))"
            >
              <polygon
                :points="getPolygonPoints(slot)"
                fill="rgba(99, 102, 241, 0.1)"
                stroke="#6366f1"
                stroke-width="0.5"
                stroke-dasharray="2,2"
                @mousedown.stop="startDrag(slots.indexOf(slot), $event)"
              />
              <circle
                v-for="(point, pIndex) in slot.points"
                :key="pIndex"
                :cx="point.x"
                :cy="point.y"
                r="1.5"
                fill="#6366f1"
                stroke="white"
                stroke-width="0.5"
                class="vertex-handle"
                @mousedown.stop="startVertexDrag(slots.indexOf(slot), pIndex, $event)"
                v-show="selectedSlotIndex === slots.indexOf(slot)"
              />
              <text
                :x="slot.points.reduce((sum, p) => sum + p.x, 0) / slot.points.length"
                :y="slot.points.reduce((sum, p) => sum + p.y, 0) / slot.points.length"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="8"
                fill="#6366f1"
                opacity="0.5"
              >{{ slots.indexOf(slot) + 1 }}</text>
            </svg>

            <!-- Regular rectangle slots and text -->
            <div
              v-for="(slot, index) in slots.filter(s => s.shape !== 'polygon')"
              :key="`slot-${index}`"
              class="preview-slot"
              :class="[
                { selected: selectedSlotIndex === slots.indexOf(slot) },
                `shape-${slot.shape || 'rectangle'}`,
                { 'is-text': slot.type === 'text' }
              ]"
              :style="getSlotStyle(slot)"
              @click.stop="selectSlot(slots.indexOf(slot))"
              @mousedown.stop="startDrag(slots.indexOf(slot), $event)"
            >
              <!-- Text overlay content -->
              <div v-if="slot.type === 'text'" class="text-overlay-content" :style="getTextStyle(slot)">
                {{ slot.content || 'Text' }}
              </div>
              <!-- Image slot label -->
              <div v-else class="slot-label">{{ slots.indexOf(slot) + 1 }}</div>
              
              <div 
                v-if="selectedSlotIndex === slots.indexOf(slot)"
                class="resize-handles"
              >
                <div class="resize-handle nw" @mousedown.stop="startResize(slots.indexOf(slot), 'nw', $event)"></div>
                <div class="resize-handle ne" @mousedown.stop="startResize(slots.indexOf(slot), 'ne', $event)"></div>
                <div class="resize-handle sw" @mousedown.stop="startResize(slots.indexOf(slot), 'sw', $event)"></div>
                <div class="resize-handle se" @mousedown.stop="startResize(slots.indexOf(slot), 'se', $event)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['close', 'save'])
const authStore = useAuthStore()

const layoutName = ref('')
const layoutCategory = ref('custom')

// Only admins can create layouts in non-custom categories
const isAdmin = computed(() => authStore.isAdmin)
const pageWidth = ref(148)
const pageHeight = ref(210)
const slots = ref([
  { x: 10, y: 10, width: 80, height: 40, type: 'image' }
])
const selectedSlotIndex = ref(0)
const showGrid = ref(true)
const snapToGrid = ref(false)
const snapToElements = ref(true)
const snapGuides = ref([])

const SNAP_THRESHOLD = 2 // percentage
const GRID_SIZE = 5 // percentage

const previewPageStyle = computed(() => {
  const aspectRatio = pageHeight.value / pageWidth.value
  const maxWidth = 600
  const width = maxWidth
  const height = width * aspectRatio
  
  return {
    width: `${width}px`,
    height: `${height}px`,
    aspectRatio: `${pageWidth.value} / ${pageHeight.value}`
  }
})

const getSlotStyle = (slot) => {
  return {
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width: `${slot.width}%`,
    height: `${slot.height}%`
  }
}

const getTextStyle = (slot) => {
  return {
    fontSize: `${slot.fontSize || 24}px`,
    color: slot.color || '#000000'
  }
}

const addSlot = (shape = 'rectangle') => {
  slots.value.push({
    type: 'image',
    shape: shape,
    x: 10,
    y: 10 + (slots.value.length * 5),
    width: 30,
    height: 30
  })
  selectedSlotIndex.value = slots.value.length - 1
}

const addPolygonSlot = () => {
  // Create a triangle by default
  slots.value.push({
    type: 'image',
    shape: 'polygon',
    points: [
      { x: 40, y: 20 },  // Top
      { x: 60, y: 60 },  // Bottom right
      { x: 20, y: 60 }   // Bottom left
    ]
  })
  selectedSlotIndex.value = slots.value.length - 1
}

const addTextOverlay = () => {
  slots.value.push({
    type: 'text',
    x: 20,
    y: 20 + (slots.value.length * 5),
    width: 60,
    height: 15,
    content: 'Your Text Here',
    fontSize: 24,
    color: '#000000'
  })
  selectedSlotIndex.value = slots.value.length - 1
}

const getPolygonPoints = (slot) => {
  return slot.points.map(p => `${p.x},${p.y}`).join(' ')
}

const deleteSlot = (index) => {
  slots.value.splice(index, 1)
  selectedSlotIndex.value = slots.value.length > 0 ? 0 : null
}

const selectSlot = (index) => {
  selectedSlotIndex.value = index
}

const deselectSlot = () => {
  selectedSlotIndex.value = null
}

// Alignment functions
const alignLeft = () => {
  if (selectedSlotIndex.value === null) return
  slots.value[selectedSlotIndex.value].x = 0
}

const alignCenter = () => {
  if (selectedSlotIndex.value === null) return
  const slot = slots.value[selectedSlotIndex.value]
  slot.x = (100 - slot.width) / 2
}

const alignRight = () => {
  if (selectedSlotIndex.value === null) return
  const slot = slots.value[selectedSlotIndex.value]
  slot.x = 100 - slot.width
}

const alignTop = () => {
  if (selectedSlotIndex.value === null) return
  slots.value[selectedSlotIndex.value].y = 0
}

const alignMiddle = () => {
  if (selectedSlotIndex.value === null) return
  const slot = slots.value[selectedSlotIndex.value]
  slot.y = (100 - slot.height) / 2
}

const alignBottom = () => {
  if (selectedSlotIndex.value === null) return
  const slot = slots.value[selectedSlotIndex.value]
  slot.y = 100 - slot.height
}

// Snapping helper functions
const snapValue = (value) => {
  snapGuides.value = []
  
  // Snap to grid
  if (snapToGrid.value) {
    const snapped = Math.round(value / GRID_SIZE) * GRID_SIZE
    if (Math.abs(value - snapped) < SNAP_THRESHOLD) {
      return snapped
    }
  }
  
  // Snap to elements
  if (snapToElements.value && dragSlotIndex !== null) {
    const currentSlot = slots.value[dragSlotIndex]
    
    for (let i = 0; i < slots.value.length; i++) {
      if (i === dragSlotIndex) continue
      
      const otherSlot = slots.value[i]
      
      // Check horizontal edges
      const edges = [
        { val: otherSlot.x, type: 'vertical', position: otherSlot.x },
        { val: otherSlot.x + otherSlot.width, type: 'vertical', position: otherSlot.x + otherSlot.width },
        { val: otherSlot.y, type: 'horizontal', position: otherSlot.y },
        { val: otherSlot.y + otherSlot.height, type: 'horizontal', position: otherSlot.y + otherSlot.height }
      ]
      
      for (const edge of edges) {
        if (Math.abs(value - edge.val) < SNAP_THRESHOLD) {
          snapGuides.value.push({ type: edge.type, position: edge.position })
          return edge.val
        }
      }
    }
  }
  
  return value
}

// Vertex dragging for polygons
let isVertexDragging = false
let vertexSlotIndex = null
let vertexPointIndex = null

const startVertexDrag = (slotIndex, pointIndex, event) => {
  event.stopPropagation()
  isVertexDragging = true
  vertexSlotIndex = slotIndex
  vertexPointIndex = pointIndex
  selectedSlotIndex.value = slotIndex
  
  document.addEventListener('mousemove', handleVertexDrag)
  document.addEventListener('mouseup', stopVertexDrag)
}

const handleVertexDrag = (event) => {
  if (!isVertexDragging || vertexSlotIndex === null || vertexPointIndex === null) return
  
  const previewPage = document.querySelector('.preview-page')
  const rect = previewPage.getBoundingClientRect()
  
  let x = ((event.clientX - rect.left) / rect.width) * 100
  let y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Apply grid snapping to vertices
  if (snapToGrid.value) {
    x = Math.round(x / GRID_SIZE) * GRID_SIZE
    y = Math.round(y / GRID_SIZE) * GRID_SIZE
  }
  
  const slot = slots.value[vertexSlotIndex]
  slot.points[vertexPointIndex].x = Math.max(0, Math.min(100, x))
  slot.points[vertexPointIndex].y = Math.max(0, Math.min(100, y))
}

const stopVertexDrag = () => {
  isVertexDragging = false
  vertexSlotIndex = null
  vertexPointIndex = null
  document.removeEventListener('mousemove', handleVertexDrag)
  document.removeEventListener('mouseup', stopVertexDrag)
}

// Drag functionality
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragSlotIndex = null

const startDrag = (index, event) => {
  isDragging = true
  dragSlotIndex = index
  dragStartX = event.clientX
  dragStartY = event.clientY
  selectedSlotIndex.value = index
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (event) => {
  if (!isDragging || dragSlotIndex === null) return
  
  const previewPage = document.querySelector('.preview-page')
  const rect = previewPage.getBoundingClientRect()
  
  const deltaX = ((event.clientX - dragStartX) / rect.width) * 100
  const deltaY = ((event.clientY - dragStartY) / rect.height) * 100
  
  const slot = slots.value[dragSlotIndex]
  
  // Handle polygon dragging
  if (slot.shape === 'polygon') {
    slot.points.forEach(point => {
      point.x = Math.max(0, Math.min(100, point.x + deltaX))
      point.y = Math.max(0, Math.min(100, point.y + deltaY))
    })
  } else {
    // Handle regular slot dragging
    let newX = Math.max(0, Math.min(100 - slot.width, slot.x + deltaX))
    let newY = Math.max(0, Math.min(100 - slot.height, slot.y + deltaY))
    
    // Apply snapping
    newX = snapValue(newX)
    newY = snapValue(newY)
    
    slot.x = newX
    slot.y = newY
  }
  
  dragStartX = event.clientX
  dragStartY = event.clientY
}

const stopDrag = () => {
  isDragging = false
  dragSlotIndex = null
  snapGuides.value = []
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// Resize functionality
let isResizing = false
let resizeSlotIndex = null
let resizeHandle = null
let resizeStartX = 0
let resizeStartY = 0
let resizeStartSlot = null

const startResize = (index, handle, event) => {
  isResizing = true
  resizeSlotIndex = index
  resizeHandle = handle
  resizeStartX = event.clientX
  resizeStartY = event.clientY
  resizeStartSlot = { ...slots.value[index] }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event) => {
  if (!isResizing || resizeSlotIndex === null) return
  
  const previewPage = document.querySelector('.preview-page')
  const rect = previewPage.getBoundingClientRect()
  
  const deltaX = ((event.clientX - resizeStartX) / rect.width) * 100
  const deltaY = ((event.clientY - resizeStartY) / rect.height) * 100
  
  const slot = slots.value[resizeSlotIndex]
  
  switch (resizeHandle) {
    case 'nw':
      slot.x = Math.max(0, resizeStartSlot.x + deltaX)
      slot.y = Math.max(0, resizeStartSlot.y + deltaY)
      slot.width = Math.max(5, resizeStartSlot.width - deltaX)
      slot.height = Math.max(5, resizeStartSlot.height - deltaY)
      break
    case 'ne':
      slot.y = Math.max(0, resizeStartSlot.y + deltaY)
      slot.width = Math.max(5, Math.min(100 - slot.x, resizeStartSlot.width + deltaX))
      slot.height = Math.max(5, resizeStartSlot.height - deltaY)
      break
    case 'sw':
      slot.x = Math.max(0, resizeStartSlot.x + deltaX)
      slot.width = Math.max(5, resizeStartSlot.width - deltaX)
      slot.height = Math.max(5, Math.min(100 - slot.y, resizeStartSlot.height + deltaY))
      break
    case 'se':
      slot.width = Math.max(5, Math.min(100 - slot.x, resizeStartSlot.width + deltaX))
      slot.height = Math.max(5, Math.min(100 - slot.y, resizeStartSlot.height + deltaY))
      break
  }
}

const stopResize = () => {
  isResizing = false
  resizeSlotIndex = null
  resizeHandle = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

const saveLayout = () => {
  if (!layoutName.value.trim()) return
  
  // Separate image slots from text elements
  const imageSlots = []
  const textElements = []
  
  slots.value.forEach(slot => {
    if (slot.type === 'text') {
      // Convert text slot to text element format
      textElements.push({
        id: `text-${Date.now()}-${Math.random()}`,
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        content: slot.content || 'Your Text Here',
        style: {
          fontSize: slot.fontSize || 24,
          color: slot.color || '#000000',
          fontWeight: 400,
          textAlign: 'left',
          padding: 10,
          lineHeight: 1.4
        }
      })
    } else {
      // Image slots - ensure they have the required type property
      imageSlots.push({
        x: slot.x,
        y: slot.y,
        width: slot.width,
        height: slot.height,
        type: 'image' // Required for rendering
      })
    }
  })
  
  const layout = {
    id: `custom-${Date.now()}`,
    name: layoutName.value,
    icon: '⭐', // Custom layouts get star icon
    category: layoutCategory.value,
    // Don't include width/height - layouts should work with any page size
    slots: imageSlots,
    textElements: textElements.length > 0 ? textElements : undefined // Only include if there are text elements
  }
  
  console.log('Saving custom layout:', JSON.stringify(layout, null, 2))
  
  emit('save', layout)
}
</script>

<style scoped>
.layout-builder {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.builder-header {
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

.builder-header h1 {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.save-btn {
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: var(--accent-strong);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.builder-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.controls-panel {
  width: 300px;
  background: var(--panel-bg);
  border-right: 1px solid var(--border);
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.layout-name-input,
.category-select {
  padding: 10px 12px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s;
}

.layout-name-input:focus,
.category-select:focus {
  outline: none;
  border-color: var(--accent);
}

.category-locked {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
  line-height: 1.4;
  margin-top: 4px;
}

.category-locked .hint {
  font-size: 12px;
  margin-top: 0;
}

.dimension-inputs {
  display: flex;
  gap: 12px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-group label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.input-group input {
  padding: 8px 10px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent);
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

.align-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.align-btn {
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s;
}

.align-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
}

.align-btn:active {
  transform: scale(0.95);
}

.add-slot-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-slot-btn:hover {
  background: var(--accent-strong);
  transform: translateY(-1px);
}

.add-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.add-element-btn {
  padding: 10px 8px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text);
  transition: all 0.2s;
}

.add-element-btn:hover {
  background: var(--muted);
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

.type-badge {
  padding: 8px 12px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  text-transform: capitalize;
}

.text-content-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.text-content-input:focus {
  outline: none;
  border-color: var(--accent);
}

.color-input {
  width: 100%;
  height: 40px;
  padding: 4px;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.slot-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-slot-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--danger);
  border-radius: 8px;
  color: var(--danger);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.delete-slot-btn:hover {
  background: var(--danger);
  color: white;
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-item {
  padding: 12px;
  background: var(--panel-bg-solid);
  border: 2px solid var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.slot-item:hover {
  border-color: var(--accent);
  background: var(--muted);
}

.slot-item.active {
  border-color: var(--accent);
  background: var(--accent);
  color: white;
}

.slot-number {
  width: 28px;
  height: 28px;
  background: var(--muted);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.slot-item.active .slot-number {
  background: rgba(255, 255, 255, 0.2);
}

.slot-info {
  font-size: 13px;
  font-weight: 500;
}

.canvas-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: auto;
}

.preview-container {
  position: relative;
}

.preview-page {
  position: relative;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.grid-overlay,
.snap-guides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.snap-guides {
  z-index: 10;
}

.polygon-slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
  z-index: 5;
}

.polygon-slot.selected polygon {
  stroke: #6366f1;
  stroke-width: 1;
  stroke-dasharray: none;
}

.vertex-handle {
  cursor: move;
  transition: all 0.15s;
}

.vertex-handle:hover {
  r: 2;
  fill: #4f46e5;
}

.preview-slot {
  position: absolute;
  border: 2px dashed var(--border);
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.1);
  cursor: move;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.preview-slot:hover {
  border-color: var(--accent);
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.15);
}

.preview-slot.selected {
  border-color: var(--accent);
  border-style: solid;
  background: rgba(var(--accent-rgb, 99, 102, 241), 0.2);
}

.slot-label {
  font-weight: 700;
  font-size: 24px;
  color: var(--accent);
  opacity: 0.5;
}

.preview-slot.is-text {
  background: rgba(0, 0, 0, 0.05);
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.2);
}

.text-overlay-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
  font-weight: 600;
  word-wrap: break-word;
  overflow: hidden;
}

.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border: 2px solid white;
  border-radius: 50%;
  pointer-events: all;
  transition: all 0.2s;
}

.resize-handle:hover {
  transform: scale(1.3);
}

.resize-handle.nw {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}

.resize-handle.ne {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}

.resize-handle.sw {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}

.resize-handle.se {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}
</style>
