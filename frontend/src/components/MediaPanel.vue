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
        <button 
          v-if="!isDemoMode && zineStore.mediaAssets.length > 0"
          class="btn-add-image" 
          @click.stop="triggerUpload" 
          :disabled="isUploading" 
          :title="isUploading ? 'Uploading...' : 'Add More Images'"
        >
          <svg v-if="!isUploading" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else class="spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="18 12" opacity="0.5"/>
          </svg>
          <span v-if="!isUploading">Add Images</span>
          <span v-else>Uploading...</span>
        </button>
        <span v-else-if="zineStore.mediaAssets.length > 0" class="demo-badge" title="Upload disabled in demo mode">Demo</span>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*,.heif,.heic"
        multiple
        @change="handleFileUpload"
        style="display: none"
      />
      
      <div v-show="imagesExpanded" class="section-content">
        <div v-if="isDemoMode" class="demo-info">
          <span class="demo-icon">ℹ️</span>
          <p>These are sample images. Sign in to upload your own photos.</p>
        </div>
        <div class="media-grid">
      <div
        v-for="asset in zineStore.mediaAssets"
        :key="asset.id"
        class="media-item"
        :class="{ 'in-use': isAssetInUse(asset.id), 'uploading': asset.isUploading }"
        :draggable="!asset.isUploading"
        @dragstart="handleDragStart($event, asset)"
        @dragend="handleDragEnd"
      >
        <!-- Show image (or placeholder if uploading) -->
        <img 
          v-if="!asset.isUploading && (asset.thumbnail || asset.url)"
          :src="asset.thumbnail || asset.url" 
          :alt="asset.name"
        />
        
        <!-- Enhanced upload overlay with progress -->
        <div v-if="asset.isUploading" class="upload-overlay">
          <div class="upload-progress-ring">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" stroke-width="3" opacity="0.2"/>
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                fill="none" 
                stroke="var(--accent)" 
                stroke-width="3"
                stroke-dasharray="100"
                :stroke-dashoffset="100 - (asset.uploadProgress || 0)"
                stroke-linecap="round"
                class="progress-circle"
              />
            </svg>
            <div class="upload-percent">{{ Math.round(asset.uploadProgress || 0) }}%</div>
          </div>
        </div>
        
        <div class="usage-badge" v-if="!asset.isUploading && isAssetInUse(asset.id)">
          ✓ {{ getAssetUsageCount(asset.id) }}
        </div>
        <div class="media-overlay" v-if="!asset.isUploading">
          <button class="delete-btn" @click="deleteAsset(asset.id)">×</button>
        </div>
        <div class="media-name">{{ asset.name }}</div>
      </div>

          <!-- Enhanced Empty State -->
          <div 
            v-if="zineStore.mediaAssets.length === 0" 
            class="empty-state-enhanced"
            @dragover.prevent="isDraggingOver = true"
            @dragleave="isDraggingOver = false"
            @drop.prevent="handleDrop"
            :class="{ 'dragging-over': isDraggingOver }"
          >
            <div class="empty-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                <path d="M8 42L20 30L28 38L40 26L56 42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
                <circle cx="22" cy="22" r="3" fill="currentColor" opacity="0.3"/>
              </svg>
            </div>
            <h4>No images yet</h4>
            <p class="empty-description">Upload images to start designing your zine</p>
            
            <button 
              v-if="!isDemoMode"
              class="btn btn-primary btn-upload-large" 
              @click="triggerUpload"
              :disabled="isUploading"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 14V6M10 6L6 10M10 6L14 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 16H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Upload Images
            </button>
            
            <div class="empty-formats">
              <span>JPG, PNG, WebP, GIF, SVG</span>
            </div>
            
            <div class="empty-drag-hint">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Or drag and drop files here
            </div>
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
            @dragend="handleDragEnd"
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
import { computed, ref, watch, onMounted } from 'vue'
import { useZineStore } from '@/stores/zineStore'
import { useAuthStore } from '@/stores/authStore'
import { uploadImage } from '@/api/images'
import { useNotification } from '@/composables/useNotification'
import { getElementSpecsByCategory } from '@/utils/elementSpecs'

const zineStore = useZineStore()
const authStore = useAuthStore()
const { toast } = useNotification()
const fileInput = ref(null)
const isCollapsed = ref(false)
const isUploading = ref(false)
const imagesExpanded = ref(true)
const elementsExpanded = ref(true)
const isDraggingOver = ref(false)

// Check if in demo mode
const isDemoMode = computed(() => zineStore.projectMeta?.id === 'demo')

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

// Handle drag and drop
const handleDrop = (event) => {
  isDraggingOver.value = false
  
  if (isDemoMode.value) {
    return
  }
  
  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) return
  
  // Trigger upload with these files
  processFiles(imageFiles)
}

const findExistingAsset = (file) => {
  // Check if file already exists by name
  return zineStore.mediaAssets.find(asset => 
    asset.name === file.name && 
    !asset.isUploading // Don't count uploading placeholders
  )
}

// Check if file is actually HEIF by reading file signature
const isActuallyHEIF = async (file) => {
  try {
    // Read first 12 bytes to check file signature
    const slice = file.slice(0, 12)
    const arrayBuffer = await slice.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    
    // HEIF/HEIC files have 'ftyp' at bytes 4-7 and 'heic', 'heix', 'hevc', 'hevx', 'mif1' at bytes 8-11
    const ftypSignature = String.fromCharCode(...bytes.slice(4, 8))
    const brandSignature = String.fromCharCode(...bytes.slice(8, 12))
    
    const isHeif = ftypSignature === 'ftyp' && 
                   (brandSignature.startsWith('heic') || 
                    brandSignature.startsWith('heix') ||
                    brandSignature.startsWith('hevc') ||
                    brandSignature.startsWith('hevx') ||
                    brandSignature.startsWith('mif1'))
    
    if (isHeif) {
      console.log(`🔍 Detected HEIF file: ${file.name} (signature: ${ftypSignature} ${brandSignature})`)
    }
    
    return isHeif
  } catch (error) {
    console.error('Failed to check file signature:', error)
    return false
  }
}

// Convert HEIF/HEIC to JPEG
const convertHeifToJpeg = async (file) => {
  try {
    console.log(`🔄 Converting HEIF: ${file.name} (${file.type})`)
    
    // Use heic2any library for conversion
    const heic2any = (await import('heic2any')).default
    
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92
    })
    
    // heic2any can return an array or single blob
    const convertedBlob = Array.isArray(result) ? result[0] : result
    
    console.log(`✅ Converted blob type: ${convertedBlob.type}, size: ${convertedBlob.size}`)
    
    // Create a new File object from the blob
    const newFileName = file.name.replace(/\.(heic|heif|jpg|jpeg)$/i, '.jpg')
    const convertedFile = new File(
      [convertedBlob],
      newFileName,
      { 
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    )
    
    console.log(`✅ Converted file: ${convertedFile.name}, type: ${convertedFile.type}, size: ${convertedFile.size}`)
    
    return convertedFile
  } catch (error) {
    console.error('❌ HEIF conversion failed:', error)
    throw error
  }
}

// Process files (shared by upload button and drag-drop)
const processFiles = async (imageFiles) => {
  if (imageFiles.length === 0) return
  
  isUploading.value = true
  
  // Convert HEIF/HEIC files to JPEG
  const processedFiles = await Promise.all(
    imageFiles.map(async (file) => {
      // Check by extension first
      const hasHeifExtension = file.name.toLowerCase().endsWith('.heif') ||
                               file.name.toLowerCase().endsWith('.heic')
      
      // Check by MIME type
      const hasHeifMimeType = file.type === 'image/heif' || 
                              file.type === 'image/heic'
      
      // Check by file signature (for misnamed files like .jpg that are actually HEIF)
      const hasHeifSignature = await isActuallyHEIF(file)
      
      const isHeif = hasHeifExtension || hasHeifMimeType || hasHeifSignature
      
      if (isHeif) {
        try {
          toast.info(`Converting ${file.name} to JPEG...`, 'Converting')
          return await convertHeifToJpeg(file)
        } catch (error) {
          console.error(`Conversion failed for ${file.name}:`, error)
          toast.error(`Failed to convert ${file.name}. Please convert manually.`, 'Conversion Failed')
          return null
        }
      }
      
      return file
    })
  )
  
  // Filter out failed conversions
  const validFiles = processedFiles.filter(f => f !== null)
  
  if (validFiles.length === 0) {
    isUploading.value = false
    return
  }
  
  // Create placeholders for each file immediately
  const placeholders = validFiles.map(file => {
    const existingAsset = findExistingAsset(file)
    
    if (existingAsset) {
      // Mark existing asset as re-uploading (overwrite mode)
      existingAsset.isUploading = true
      existingAsset.uploadProgress = 0
      return { file, placeholderId: existingAsset.id, isOverwrite: true }
    } else {
      // Create new placeholder
      const placeholderId = `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      zineStore.addMediaAsset({
        id: placeholderId,
        name: file.name,
        url: '', // Will be replaced
        thumbnail: '',
        type: file.type,
        isUploading: true,
        uploadProgress: 0
      })
      
      return { file, placeholderId, isOverwrite: false }
    }
  })
  
  // Upload function for a single image
  const uploadSingleImage = async ({ file, placeholderId, isOverwrite }) => {
    try {
      // Start progress simulation
      zineStore.updateMediaAssetProgress(placeholderId, 5) // Show initial progress immediately
      
      let currentProgress = 5
      
      const progressInterval = setInterval(() => {
        if (currentProgress < 85) {
          currentProgress += Math.random() * 20 + 5 // Random increment between 5-25%
          zineStore.updateMediaAssetProgress(placeholderId, Math.min(currentProgress, 85))
        }
      }, 150)
      
      const imageMetadata = await uploadImage(file, {
        bookId: zineStore.projectMeta?.id || null
      })
      
      clearInterval(progressInterval)
      
      // Complete progress with a smooth transition
      zineStore.updateMediaAssetProgress(placeholderId, 95)
      await new Promise(resolve => setTimeout(resolve, 100))
      zineStore.updateMediaAssetProgress(placeholderId, 100)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (isOverwrite) {
        // Overwrite: Keep same ID, just update URLs
        zineStore.replaceMediaAsset(placeholderId, {
          id: placeholderId, // Keep original ID!
          name: imageMetadata.originalName,
          url: imageMetadata.variants.display.url,
          thumbnail: imageMetadata.variants.thumbnail.url,
          type: imageMetadata.mimeType,
          originalUrl: imageMetadata.variants.original.url,
          imageId: imageMetadata.id,
          isUploading: false
        })
        return { success: true, isOverwrite: true }
      } else {
        // New upload: Use new ID from backend
        zineStore.replaceMediaAsset(placeholderId, {
          id: imageMetadata.id,
          name: imageMetadata.originalName,
          url: imageMetadata.variants.display.url,
          thumbnail: imageMetadata.variants.thumbnail.url,
          type: imageMetadata.mimeType,
          originalUrl: imageMetadata.variants.original.url,
          imageId: imageMetadata.id,
          isUploading: false
        })
        return { success: true, isOverwrite: false }
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      
      if (!isOverwrite) {
        // Remove failed placeholder (only if it was new)
        zineStore.removeMediaAsset(placeholderId)
      } else {
        // Reset uploading flag on existing asset
        const asset = zineStore.mediaAssets.find(a => a.id === placeholderId)
        if (asset) asset.isUploading = false
      }
      return { success: false, isOverwrite }
    }
  }
  
  // Upload images sequentially (one at a time)
  const results = []
  
  for (const placeholder of placeholders) {
    const result = await uploadSingleImage(placeholder)
    results.push(result)
  }
  
  // Count results
  const newCount = results.filter(r => r.success && !r.isOverwrite).length
  const overwriteCount = results.filter(r => r.success && r.isOverwrite).length
  const failCount = results.filter(r => !r.success).length
  
  isUploading.value = false
  
  // Show success notification
  if (newCount + overwriteCount > 0) {
    const total = newCount + overwriteCount
    toast.success(
      `${total} image${total > 1 ? 's' : ''} uploaded and auto-saved`,
      'Images Ready'
    )
  }
  
  // Show error if there were failures
  if (failCount > 0) {
    toast.error(`${failCount} image${failCount > 1 ? 's' : ''} failed to upload`, 'Upload Error')
  }
}

const handleFileUpload = async (event) => {
  // Prevent uploads in demo mode
  if (isDemoMode.value) {
    alert('Uploads are disabled in demo mode. Sign in to create your own photobook and upload images.')
    event.target.value = ''
    return
  }
  
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  // Filter for images only (including HEIF/HEIC which may not have proper MIME type)
  const imageFiles = files.filter(file => {
    const isImage = file.type.startsWith('image/')
    const isHeif = file.name.toLowerCase().endsWith('.heif') || file.name.toLowerCase().endsWith('.heic')
    return isImage || isHeif
  })
  
  if (imageFiles.length === 0) {
    alert('Please select image files only')
    event.target.value = ''
    return
  }
  
  await processFiles(imageFiles)
  event.target.value = '' // Reset input
}

const handleDragStart = (event, asset) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('assetId', asset.id.toString())
  
  // Create custom drag image
  const dragImage = document.createElement('div')
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    width: 120px;
    height: 120px;
    background: var(--panel-bg);
    border: 2px solid var(--accent);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    backdrop-filter: blur(10px);
  `
  
  const img = document.createElement('img')
  img.src = asset.thumbnail
  img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;'
  dragImage.appendChild(img)
  
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 60, 60)
  
  // Clean up drag image after a short delay
  setTimeout(() => document.body.removeChild(dragImage), 0)
  
  // Add dragging class to body for global styling
  document.body.classList.add('dragging-image')
}

const handleDragEnd = () => {
  document.body.classList.remove('dragging-image')
}

const handleTextTemplateDragStart = (event, elementSpec) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('elementSpec', JSON.stringify({
    specId: elementSpec.id,
    type: elementSpec.type
  }))
}

const deleteAsset = (id) => {
  if (isDemoMode.value) {
    alert('Cannot delete images in demo mode. Sign in to create your own photobook.')
    return
  }
  
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

.demo-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 4px;
  cursor: help;
}

.demo-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: color-mix(in srgb, var(--accent) 10%, var(--panel-bg));
  border-left: 3px solid var(--accent);
  margin: 0 20px 10px 20px;
  border-radius: 6px;
}

.demo-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.demo-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
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

/* Enhanced Empty State */
.empty-state-enhanced {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 48px 60px;
  min-height: 320px;
  border: 2px dashed var(--border);
  border-radius: 16px;
  margin: 16px;
  background: var(--muted);
  transition: all 0.3s ease;
  max-width: 100%;
}

.empty-state-enhanced.dragging-over {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--muted));
  transform: scale(1.02);
}

.empty-icon {
  margin-bottom: 24px;
  color: var(--text-muted);
  opacity: 0.4;
}

.empty-icon svg {
  width: 56px;
  height: 56px;
}

.empty-state-enhanced h4 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  margin-bottom: 28px;
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
}

.btn-upload-large {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-upload-large svg {
  flex-shrink: 0;
}

.empty-formats {
  font-size: 12px;
  color: var(--text-muted);
  padding: 8px 16px;
  background: var(--panel-bg);
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.empty-drag-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  opacity: 0.5;
  margin-top: 4px;
}

.empty-drag-hint svg {
  opacity: 0.5;
}

/* Enhanced Add Images Button */
.btn-add-image {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-add-image:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent) 90%, black);
  transform: translateY(-1px);
}

.btn-add-image:active:not(:disabled) {
  transform: translateY(0);
}

.btn-add-image:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add-image svg {
  flex-shrink: 0;
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

/* Upload state */
.media-item.uploading {
  cursor: not-allowed;
  position: relative;
}


/* Overlay with spinner */
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

/* Upload Progress Ring */
.upload-progress-ring {
  position: relative;
  width: 40px;
  height: 40px;
}

.upload-progress-ring svg {
  transform: rotate(-90deg);
}

.progress-circle {
  transition: stroke-dashoffset 0.3s ease;
}

.upload-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
