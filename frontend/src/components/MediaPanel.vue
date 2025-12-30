<template>
  <div class="media-panel" :class="{ collapsed: isCollapsed }">
    <div v-if="!isCollapsed" class="panel-content">
      <div class="panel-header">
        <h3>Media Pool</h3>
        <button class="collapse-btn" @click.stop="isCollapsed = true" title="Collapse">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

    <!-- Images Section -->
    <div class="section" :class="{ 'section-expanded': imagesExpanded && !elementsExpanded }">
      <div class="section-header" @click="imagesExpanded = !imagesExpanded">
        <svg class="chevron" :class="{ expanded: imagesExpanded }" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Images {{ isUploading ? '(Uploading...)' : '' }}</h4>
        <button class="btn-icon" @click.stop="triggerUpload" :disabled="isUploading" :title="isUploading ? 'Uploading...' : 'Add Image'">
          <svg v-if="!isUploading" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg v-else class="spinner" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="2" stroke-dasharray="15 10" opacity="0.5"/>
          </svg>
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileUpload"
        style="display: none"
      />
      
      <div v-show="imagesExpanded" class="section-content">
        <div class="media-grid">
      <div
        v-for="asset in zineStore.mediaAssets"
        :key="asset.id"
        class="media-item"
        :class="{ 'in-use': isAssetInUse(asset.id) }"
        draggable="true"
        @dragstart="handleDragStart($event, asset)"
      >
        <img :src="asset.thumbnail" :alt="asset.name" />
        <div class="usage-badge" v-if="isAssetInUse(asset.id)">
          ✓ {{ getAssetUsageCount(asset.id) }}
        </div>
        <div class="media-overlay">
          <button class="delete-btn" @click="deleteAsset(asset.id)">×</button>
        </div>
        <div class="media-name">{{ asset.name }}</div>
      </div>

          <div v-if="zineStore.mediaAssets.length === 0" class="empty-state">
            <p>📁</p>
            <p>No images yet</p>
            <p class="hint">Click + to upload</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Elements Section -->
    <div class="section" :class="{ 'section-expanded': elementsExpanded && !imagesExpanded }">
      <div class="section-header" @click="elementsExpanded = !elementsExpanded">
        <svg class="chevron" :class="{ expanded: elementsExpanded }" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h4>Elements</h4>
      </div>
      
      <div v-show="elementsExpanded" class="section-content">
        <div class="elements-grid">
          <div
            v-for="template in textTemplates"
            :key="template.id"
            class="element-item"
            draggable="true"
            @dragstart="handleTextTemplateDragStart($event, template)"
          >
            <div class="element-preview" :style="template.previewStyle">
              {{ template.preview }}
            </div>
            <div class="element-name">{{ template.name }}</div>
          </div>
        </div>
      </div>
    </div>
    </div>
    
    <!-- Collapsed Sidebar -->
    <div v-else class="collapsed-sidebar">
      <button class="expand-btn" @click="isCollapsed = false" title="Expand Media Pool">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class="collapsed-content">
        <!-- Collapsed Images -->
        <div class="collapsed-section">
          <div class="collapsed-section-label">IMG</div>
          <div
            v-for="asset in zineStore.mediaAssets.slice(0, 8)"
            :key="asset.id"
            class="collapsed-item"
            draggable="true"
            @dragstart="handleDragStart($event, asset)"
            :title="asset.name"
          >
            <img :src="asset.thumbnail" :alt="asset.name" />
          </div>
        </div>
        
        <!-- Collapsed Elements -->
        <div class="collapsed-section">
          <div class="collapsed-section-label">TXT</div>
          <div
            v-for="template in textTemplates.slice(0, 6)"
            :key="template.id"
            class="collapsed-item collapsed-text"
            draggable="true"
            @dragstart="handleTextTemplateDragStart($event, template)"
            :title="template.name"
          >
            <span :style="{ fontSize: '10px', fontWeight: template.defaultProps?.style?.fontWeight > 600 ? '700' : '400' }">
              {{ template.preview }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useZineStore } from '../stores/zineStore'
import { getElementSpecsByCategory } from '../utils/elementSpecs'
import { uploadMultipleImages } from '../api/images'

const zineStore = useZineStore()
const fileInput = ref(null)
const isCollapsed = ref(false)
const imagesExpanded = ref(true)
const elementsExpanded = ref(true)
const isUploading = ref(false)

const emit = defineEmits(['collapsed-change'])

// Get text element specs
const textTemplates = getElementSpecsByCategory('text')

// Watch for collapsed state changes
watch(isCollapsed, (newValue) => {
  emit('collapsed-change', newValue)
})

// Check if an asset is currently in use
const isAssetInUse = (assetId) => {
  return zineStore.pages.some(page => 
    page.slots.some(slot => String(slot.assetId) === String(assetId))
  )
}

// Count how many times an asset is used
const getAssetUsageCount = (assetId) => {
  let count = 0
  zineStore.pages.forEach(page => {
    page.slots.forEach(slot => {
      if (String(slot.assetId) === String(assetId)) {
        count++
      }
    })
  })
  return count
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  // Filter for images only
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    alert('Please select image files only')
    event.target.value = ''
    return
  }
  
  isUploading.value = true
  
  try {
    const result = await uploadMultipleImages(imageFiles, {
      bookId: zineStore.projectMeta?.id || null
    })
    
    // Add uploaded images to media pool
    result.images.forEach(imageMetadata => {
      zineStore.addMediaAsset({
        id: imageMetadata.id,
        name: imageMetadata.originalName,
        url: imageMetadata.variants.display.url,
        thumbnail: imageMetadata.variants.thumbnail.url,
        type: imageMetadata.mimeType,
        originalUrl: imageMetadata.variants.original.url,
        // Store the image ID for future reference
        imageId: imageMetadata.id
      })
    })
    
    // Show summary if there were any errors
    if (result.errors && result.errors.length > 0) {
      console.warn('Some images failed to upload:', result.errors)
      alert(`Uploaded ${result.summary.uploaded}/${result.summary.total} images. ${result.summary.failed} failed.`)
    }
  } catch (error) {
    console.error('Failed to upload images:', error)
    alert(`Failed to upload images: ${error.message}`)
  } finally {
    isUploading.value = false
    // Reset input
    event.target.value = ''
  }
}

const handleDragStart = (event, asset) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('assetId', asset.id.toString())
}

const handleTextTemplateDragStart = (event, elementSpec) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('elementSpec', JSON.stringify({
    specId: elementSpec.id,
    type: elementSpec.type
  }))
}

const deleteAsset = (id) => {
  if (confirm('Delete this media asset?')) {
    zineStore.removeMediaAsset(id)
  }
}
</script>

<style scoped>
.media-panel {
  width: 300px;
  background: var(--panel-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background var(--transition), border-color var(--transition);
  position: relative;
}

.media-panel.collapsed {
  width: 48px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.media-panel::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent);
  pointer-events: none;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color var(--transition);
  flex-shrink: 0;
}

.panel-header h3 {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.01em;
  transition: color var(--transition);
}

.collapse-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
  position: relative;
  z-index: 10;
}

.collapse-btn:hover {
  background: var(--muted);
  color: var(--text);
  transform: scale(1.05);
}

/* Collapsed Sidebar */
.collapsed-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.expand-btn {
  background: transparent;
  border: none;
  width: 48px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid var(--border);
}

.expand-btn:hover {
  background: var(--muted);
  color: var(--accent);
}

.collapsed-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  padding: 8px 0;
}

.collapsed-section {
  margin-bottom: 16px;
}

.collapsed-section-label {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  padding: 4px 0;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.collapsed-item {
  width: 36px;
  height: 36px;
  margin: 0 auto 6px;
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: var(--panel-bg-solid);
}

.collapsed-item:hover {
  transform: scale(1.05);
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.collapsed-item:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.collapsed-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.collapsed-item.collapsed-text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--muted);
}

.collapsed-item.collapsed-text span {
  color: var(--text);
  user-select: none;
}

.section {
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  transition: flex 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section.section-expanded {
  flex: 3;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  flex-shrink: 0;
}

.section-header:hover {
  background: var(--muted);
}

.section-header h4 {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(-90deg);
}

.chevron.expanded {
  transform: rotate(0deg);
}

.btn-icon {
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
  transition: all 0.15s;
}

.btn-icon:hover {
  background: var(--panel-bg-solid);
  color: var(--accent);
  transform: scale(1.1);
}

.section-content {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.media-grid {
  overflow-y: visible;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  align-content: start;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: grab;
  background: var(--panel-bg-solid);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.1);
  border: 2px solid var(--border);
}

.media-item.in-use {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.1);
}

.usage-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  z-index: 10;
  pointer-events: none;
}

.media-item:active {
  cursor: grabbing;
  transform: scale(0.95) rotate(2deg);
}

.media-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-md);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.delete-btn {
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
}

.delete-btn:hover {
  background: var(--danger-strong);
  transform: scale(1.1);
}

.media-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  padding: 8px 10px 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-muted);
  text-align: center;
}
.empty-state .hint {
  font-size: 13px;
  color: var(--text-muted);
  opacity: 0.8;
}

/* Elements Grid */
.elements-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.element-item {
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 12px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.element-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.element-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.element-preview {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--muted);
  border-radius: 6px;
  color: var(--text);
}

.element-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-align: center;
}

/* Upload spinner animation */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
