<template>
  <div class="page-panel" :class="{ collapsed: isCollapsed }">
    <div v-if="!isCollapsed" class="panel-content">
      <div class="panel-header">
        <h3>Pages</h3>
        <button class="collapse-btn" @click="isCollapsed = true" title="Collapse">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="page-list">
      <div
        v-for="(page, index) in zineStore.pages"
        :key="page.id"
        class="page-thumbnail"
        :class="{ active: page.id === zineStore.selectedPageId }"
        draggable="true"
        @dragstart="handleDragStart($event, index)"
        @dragover.prevent
        @drop="handleDrop($event, index)"
        @click="selectAndScrollToPage(page.id)"
      >
        <div class="page-number">{{ index + 1 }}</div>
        <div class="page-preview" :style="pagePreviewStyle">
          <canvas 
            :ref="el => pageCanvasRefs[page.id] = el"
            class="preview-canvas"
            :width="150"
            :height="150 * ((zineStore.zineConfig?.height || 210) / (zineStore.zineConfig?.width || 148))"
          ></canvas>
        </div>
        <button class="delete-page-btn" @click.stop="deletePage(page.id)">×</button>
      </div>

      <div v-if="zineStore.pages.length === 0" class="empty-state">
        <p>📄</p>
        <p>No pages yet</p>
        <p class="hint">Select a layout from the toolbar to add pages</p>
      </div>
    </div>
    </div>
    
    <!-- Collapsed Sidebar -->
    <div v-else class="collapsed-sidebar">
      <button class="expand-btn" @click="isCollapsed = false" title="Expand Pages">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class="collapsed-content">
        <div
          v-for="(page, index) in zineStore.pages"
          :key="page.id"
          class="collapsed-page"
          :class="{ active: page.id === zineStore.selectedPageId }"
          @click="selectAndScrollToPage(page.id)"
          :title="`Page ${index + 1}`"
        >
          <div class="collapsed-page-number">{{ index + 1 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useZineStore } from '@/stores/zineStore'
import html2canvas from 'html2canvas'

const zineStore = useZineStore()
const pageCanvasRefs = ref({})
const isCollapsed = ref(false)

const emit = defineEmits(['collapsed-change'])

let draggedIndex = null

// Watch for collapsed state changes
watch(isCollapsed, (newValue) => {
  emit('collapsed-change', newValue)
})

// Select page and scroll to it
const selectAndScrollToPage = (pageId) => {
  zineStore.selectPage(pageId)
  
  // Scroll to page in canvas
  nextTick(() => {
    const pageElement = document.querySelector(`.page-canvas[data-page-id="${pageId}"]`)
    if (pageElement) {
      pageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      })
    }
  })
}

const handleDragStart = (event, index) => {
  draggedIndex = index
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event, dropIndex) => {
  event.preventDefault()
  if (draggedIndex !== null && draggedIndex !== dropIndex) {
    zineStore.reorderPages(draggedIndex, dropIndex)
  }
  draggedIndex = null
}

const deletePage = (id) => {
  if (confirm('Delete this page?')) {
    zineStore.removePage(id)
  }
}

const pagePreviewStyle = computed(() => {
  const cfg = zineStore.zineConfig
  if (!cfg) return {}
  const w = cfg.width
  const h = cfg.height
  return {
    aspectRatio: `${w} / ${h}`,
  }
})

// Debounce timer and dirty pages tracking
let renderTimeout = null
const dirtyPages = new Set()

// Render specific page preview
const renderPagePreview = async (pageId) => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 50))
  
  const pageElement = document.querySelector(`.page-canvas[data-page-id="${pageId}"]`)
  const canvasEl = pageCanvasRefs.value[pageId]
  
  if (!pageElement || !canvasEl) return
  
  try {
    pageElement.classList.add('export-mode')
    
    const guidesElement = pageElement.querySelector('.guides')
    const originalDisplay = guidesElement ? guidesElement.style.display : null
    if (guidesElement) {
      guidesElement.style.display = 'none'
    }
    
    const capturedCanvas = await html2canvas(pageElement, {
      scale: 0.4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0
    })
    
    if (guidesElement && originalDisplay !== null) {
      guidesElement.style.display = originalDisplay
    }
    pageElement.classList.remove('export-mode')
    
    // Check if canvas has valid dimensions before drawing
    if (capturedCanvas.width === 0 || capturedCanvas.height === 0) {
      console.warn('Captured canvas has invalid dimensions, skipping render')
      return
    }
    
    if (canvasEl.width === 0 || canvasEl.height === 0) {
      console.warn('Target canvas has invalid dimensions, skipping render')
      return
    }
    
    const ctx = canvasEl.getContext('2d')
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    ctx.drawImage(capturedCanvas, 0, 0, canvasEl.width, canvasEl.height)
  } catch (error) {
    console.error('Error rendering page preview:', error)
  }
}

// Render only dirty pages (debounced)
const renderDirtyPages = async () => {
  if (renderTimeout) {
    clearTimeout(renderTimeout)
  }
  
  renderTimeout = setTimeout(async () => {
    const pagesToRender = Array.from(dirtyPages)
    dirtyPages.clear()
    
    for (const pageId of pagesToRender) {
      await renderPagePreview(pageId)
    }
  }, 1000) // Increased to 1000ms for less frequent updates
}

// Mark specific page as dirty
const markPageDirty = (pageId) => {
  dirtyPages.add(pageId)
  renderDirtyPages()
}

// Render all pages (initial load)
const renderAllPages = async () => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  
  for (const page of zineStore.pages) {
    await renderPagePreview(page.id)
  }
}

// Watch for page count changes (add/delete) - re-render all
watch(() => zineStore.pages.length, () => {
  renderAllPages()
})

// Watch for media changes - mark all pages dirty
watch(() => zineStore.mediaAssets, () => {
  zineStore.pages.forEach(page => markPageDirty(page.id))
}, { deep: true })

// Watch for selected page changes - only mark that page dirty
watch(() => zineStore.selectedPageId, (newId) => {
  if (newId) {
    markPageDirty(newId)
  }
})

// Watch individual page slots/text changes - only update that specific page
watch(() => zineStore.pages.map(p => ({ 
  id: p.id, 
  slots: p.slots.map(s => s.assetId + s.fit + s.innerMarginPx),
  textElements: p.textElements.length
})), (newPages, oldPages) => {
  if (!oldPages) return
  
  newPages.forEach((newPage, index) => {
    const oldPage = oldPages[index]
    if (oldPage && JSON.stringify(newPage) !== JSON.stringify(oldPage)) {
      markPageDirty(newPage.id)
    }
  })
}, { deep: true })

onMounted(() => {
  renderAllPages()
})
</script>

<style scoped>
.page-panel {
  width: 220px;
  background: var(--panel-bg);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background var(--transition), border-color var(--transition);
  position: relative;
}

.page-panel.collapsed {
  width: 48px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.page-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent);
  pointer-events: none;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  transition: border-color var(--transition);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.collapsed-page {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  border-radius: 6px;
  border: 2px solid var(--border);
  background: var(--panel-bg-solid);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapsed-page:hover {
  transform: translateX(-2px);
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.collapsed-page.active {
  border-color: var(--accent);
  background: var(--accent);
}

.collapsed-page-number {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}

.collapsed-page.active .collapsed-page-number {
  color: white;
}

.page-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-thumbnail {
  position: relative;
  background: var(--panel-bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
}

.page-thumbnail:hover {
  border-color: var(--accent);
  transform: translateX(-6px) translateY(-2px);
  box-shadow: var(--shadow-md);
}

.page-thumbnail.active {
  border-color: var(--accent);
  background: var(--accent);
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  box-shadow: 0 0 0 2px var(--accent);
  box-shadow: var(--shadow-lg), 0 0 0 2px color-mix(in srgb, var(--accent) 10%, transparent);
}

.page-number {
  position: absolute;
  top: 8px;
  left: 8px;
  background: white;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
  transition: all var(--transition);
}

.page-thumbnail.active .page-number {
  background: var(--accent);
  color: white;
}

.page-preview {
  position: relative;
  width: 100%;
  background: var(--panel-bg-solid);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.05), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all var(--transition);
}

.page-thumbnail.active .page-preview {
  border-color: white;
  box-shadow: 0 0 0 2px white;
}

.page-inner {
  position: absolute;
  inset: 0;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.preview-slot {
  border: 1px dashed var(--border);
  background: var(--muted);
  overflow: hidden;
  transition: all var(--transition);
}

.preview-slot-inner {
  position: absolute;
  inset: 0;
}

.preview-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-page-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 1;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}

.page-thumbnail:hover .delete-page-btn {
  display: flex;
}

.delete-page-btn:hover {
  background: var(--danger-strong);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state p:first-child {
  font-size: 52px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-state p:nth-child(2) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.empty-state .hint {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.8;
}
</style>
