<template>
  <div class="cover-designer-modal" @click.self="$emit('close')">
    <div class="cover-designer-container">
      <div class="cover-designer-header">
        <h2>🎨 Design Your Book Cover</h2>
        <p>Create professional front cover, back cover, and spine designs</p>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Cover Type Tabs -->
      <div class="cover-tabs">
        <button
          v-for="cover in coverTypes"
          :key="cover.id"
          class="cover-tab"
          :class="{ active: selectedCover === cover.id }"
          @click="selectCover(cover.id)"
        >
          {{ cover.icon }} {{ cover.name }}
        </button>
      </div>

      <!-- Design Canvas -->
      <div class="design-canvas-container">
        <div class="canvas-wrapper">
          <div class="cover-preview" :class="`cover-${selectedCover}`">
            <!-- Front Cover -->
            <div
              v-if="selectedCover === 'front'"
              class="cover-canvas front-cover"
              :style="getCoverStyle('front')"
            >
              <div class="cover-content" v-if="designs.front">
                <div class="design-element" v-for="element in designs.front.elements" :key="element.id" :style="getElementStyle(element)">
                  <template v-if="element.type === 'text'">
                    {{ element.content }}
                  </template>
                  <template v-if="element.type === 'image'">
                    <img :src="element.src" :style="element.style" />
                  </template>
                </div>
              </div>
              <div v-else class="empty-cover">
                <div class="empty-icon">📖</div>
                <div class="empty-text">Front Cover</div>
              </div>
            </div>

            <!-- Back Cover -->
            <div
              v-if="selectedCover === 'back'"
              class="cover-canvas back-cover"
              :style="getCoverStyle('back')"
            >
              <div class="cover-content" v-if="designs.back">
                <div class="design-element" v-for="element in designs.back.elements" :key="element.id" :style="getElementStyle(element)">
                  <template v-if="element.type === 'text'">
                    {{ element.content }}
                  </template>
                  <template v-if="element.type === 'image'">
                    <img :src="element.src" :style="element.style" />
                  </template>
                </div>
              </div>
              <div v-else class="empty-cover">
                <div class="empty-icon">📚</div>
                <div class="empty-text">Back Cover</div>
              </div>
            </div>

            <!-- Spine -->
            <div
              v-if="selectedCover === 'spine'"
              class="cover-canvas spine-cover"
              :style="getCoverStyle('spine')"
            >
              <div class="cover-content spine-content" v-if="designs.spine">
                <div class="design-element" v-for="element in designs.spine.elements" :key="element.id" :style="getElementStyle(element)">
                  <template v-if="element.type === 'text'">
                    {{ element.content }}
                  </template>
                  <template v-if="element.type === 'image'">
                    <img :src="element.src" :style="element.style" />
                  </template>
                </div>
              </div>
              <div v-else class="empty-spine">
                <div class="empty-icon">📓</div>
                <div class="empty-text">Spine</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Design Tools -->
        <div class="design-tools">
          <div class="tool-section">
            <h4>Add Elements</h4>
            <div class="tool-buttons">
              <button class="tool-btn" @click="addTextElement">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7V4H20V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M9 20H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Text
              </button>
              <button class="tool-btn" @click="addImageElement">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
                </svg>
                Image
              </button>
            </div>
          </div>

          <div class="tool-section">
            <h4>Background</h4>
            <div class="color-picker">
              <input type="color" v-model="currentDesign.backgroundColor" @input="updateBackground" />
              <span>{{ currentDesign.backgroundColor }}</span>
            </div>
          </div>

          <!-- Element Properties (when element selected) -->
          <div class="tool-section" v-if="selectedElement">
            <h4>Element Properties</h4>

            <div class="property-group" v-if="selectedElement.type === 'text'">
              <label>Text Content</label>
              <input type="text" v-model="selectedElement.content" @input="updateElement" />
            </div>

            <div class="property-group">
              <label>Position</label>
              <div class="position-controls">
                <div class="control-item">
                  <label>X</label>
                  <input type="number" v-model.number="selectedElement.x" @input="updateElement" min="0" :max="getMaxX()" />
                </div>
                <div class="control-item">
                  <label>Y</label>
                  <input type="number" v-model.number="selectedElement.y" @input="updateElement" min="0" :max="getMaxY()" />
                </div>
              </div>
            </div>

            <div class="property-group">
              <label>Size</label>
              <div class="size-controls">
                <div class="control-item">
                  <label>Width</label>
                  <input type="number" v-model.number="selectedElement.width" @input="updateElement" min="10" :max="getMaxWidth()" />
                </div>
                <div class="control-item">
                  <label>Height</label>
                  <input type="number" v-model.number="selectedElement.height" @input="updateElement" min="10" :max="getMaxHeight()" />
                </div>
              </div>
            </div>

            <div class="property-group" v-if="selectedElement.type === 'text'">
              <label>Font Size</label>
              <input type="number" v-model.number="selectedElement.fontSize" @input="updateElement" min="8" max="72" />
            </div>

            <div class="property-group" v-if="selectedElement.type === 'text'">
              <label>Color</label>
              <input type="color" v-model="selectedElement.color" @input="updateElement" />
            </div>

            <button class="delete-btn" @click="deleteElement">Delete Element</button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="cover-designer-actions">
        <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="saveDesigns">Save Cover Design</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'

const props = defineProps({
  bookWidth: { type: Number, required: true },
  bookHeight: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  spineWidth: { type: Number, default: 12 } // mm
})

const emit = defineEmits(['close', 'save-designs'])

// Cover types
const coverTypes = [
  { id: 'front', name: 'Front Cover', icon: '📖' },
  { id: 'back', name: 'Back Cover', icon: '📚' },
  { id: 'spine', name: 'Spine', icon: '📓' }
]

const selectedCover = ref('front')
const selectedElement = ref(null)

// Design data for each cover part
const designs = reactive({
  front: {
    backgroundColor: '#ffffff',
    elements: []
  },
  back: {
    backgroundColor: '#ffffff',
    elements: []
  },
  spine: {
    backgroundColor: '#f5f5f5',
    elements: []
  }
})

const currentDesign = computed(() => designs[selectedCover.value])

// Canvas dimensions (in pixels, scaled for editing)
const canvasScale = 0.5 // 1mm = 0.5px for editing
const frontWidth = computed(() => props.bookWidth * canvasScale)
const frontHeight = computed(() => props.bookHeight * canvasScale)
const backWidth = computed(() => props.bookWidth * canvasScale)
const backHeight = computed(() => props.bookHeight * canvasScale)
const spineWidthPx = computed(() => props.spineWidth * canvasScale)
const spineHeight = computed(() => props.bookHeight * canvasScale)

const selectCover = (coverId) => {
  selectedCover.value = coverId
  selectedElement.value = null
}

const getCoverStyle = (coverType) => {
  const design = designs[coverType]
  return {
    backgroundColor: design.backgroundColor,
    width: coverType === 'spine' ? `${spineWidthPx.value}px` : `${frontWidth.value}px`,
    height: `${coverType === 'spine' ? spineHeight.value : (coverType === 'front' ? frontHeight.value : backHeight.value)}px`
  }
}

const getElementStyle = (element) => {
  const baseStyle = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
  }

  if (element.type === 'text') {
    return {
      ...baseStyle,
      fontSize: `${element.fontSize || 16}px`,
      color: element.color || '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden'
    }
  }

  return baseStyle
}

const addTextElement = () => {
  const element = {
    id: Date.now(),
    type: 'text',
    content: 'Your Text Here',
    x: 20,
    y: 20,
    width: 200,
    height: 50,
    fontSize: 24,
    color: '#000000'
  }

  currentDesign.value.elements.push(element)
  selectedElement.value = element
}

const addImageElement = () => {
  // For now, just add a placeholder - in real implementation, this would open an image picker
  const element = {
    id: Date.now(),
    type: 'image',
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD4KPC9zdmc+',
    x: 20,
    y: 20,
    width: 100,
    height: 100
  }

  currentDesign.value.elements.push(element)
  selectedElement.value = element
}

const updateBackground = () => {
  // Background already updates reactively
}

const updateElement = () => {
  // Element updates reactively
}

const deleteElement = () => {
  if (!selectedElement.value) return

  const index = currentDesign.value.elements.findIndex(el => el.id === selectedElement.value.id)
  if (index !== -1) {
    currentDesign.value.elements.splice(index, 1)
  }
  selectedElement.value = null
}

const getMaxX = () => {
  return selectedCover.value === 'spine' ? spineWidthPx.value - (selectedElement.value?.width || 0) : frontWidth.value - (selectedElement.value?.width || 0)
}

const getMaxY = () => {
  return spineHeight.value - (selectedElement.value?.height || 0)
}

const getMaxWidth = () => {
  return selectedCover.value === 'spine' ? spineWidthPx.value - (selectedElement.value?.x || 0) : frontWidth.value - (selectedElement.value?.x || 0)
}

const getMaxHeight = () => {
  return spineHeight.value - (selectedElement.value?.y || 0)
}

const saveDesigns = () => {
  // Validate that all covers have some content
  const hasFrontContent = designs.front.elements.length > 0
  const hasBackContent = designs.back.elements.length > 0
  const hasSpineContent = designs.spine.elements.length > 0

  if (!hasFrontContent && !hasBackContent && !hasSpineContent) {
    alert('Please add some content to at least one cover part before saving.')
    return
  }

  emit('save-designs', {
    front: designs.front,
    back: designs.back,
    spine: designs.spine
  })
}
</script>

<style scoped>
.cover-designer-modal {
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

.cover-designer-container {
  background: var(--panel-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.cover-designer-header {
  padding: 32px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.cover-designer-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}

.cover-designer-header p {
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

.cover-tabs {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 12px;
}

.cover-tab {
  padding: 12px 24px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-tab:hover {
  background: var(--border);
}

.cover-tab.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.design-canvas-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--bg);
}

.cover-preview {
  position: relative;
  display: flex;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cover-front .front-cover,
.cover-back .back-cover {
  border-radius: 4px 12px 12px 4px;
}

.cover-spine .spine-cover {
  background: #f5f5f5;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
}

.cover-canvas {
  position: relative;
  background: white;
  border: 1px solid var(--border);
  overflow: hidden;
}

.cover-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.design-element {
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.design-element:hover {
  border-color: var(--accent);
}

.empty-cover,
.empty-spine {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
}

.empty-spine .empty-icon {
  font-size: 32px;
}

.empty-spine .empty-text {
  font-size: 14px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.design-tools {
  width: 320px;
  background: var(--panel-bg);
  border-left: 1px solid var(--border);
  padding: 24px;
  overflow-y: auto;
}

.tool-section {
  margin-bottom: 32px;
}

.tool-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.property-group {
  margin-bottom: 20px;
}

.property-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.property-group input[type="text"],
.property-group input[type="number"],
.property-group input[type="color"] {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 14px;
}

.property-group input[type="color"] {
  width: 60px;
  height: 40px;
  padding: 0;
}

.position-controls,
.size-controls {
  display: flex;
  gap: 12px;
}

.control-item {
  flex: 1;
}

.control-item label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 4px;
  display: block;
}

.control-item input {
  width: 100%;
}

.delete-btn {
  width: 100%;
  padding: 12px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: var(--danger-strong);
  transform: translateY(-1px);
}

.cover-designer-actions {
  padding: 24px 32px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  background: var(--muted);
}

.btn-primary {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}
</style>
