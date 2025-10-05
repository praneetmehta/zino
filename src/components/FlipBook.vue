<template>
  <div class="flipbook-container">
    <div class="flipbook-header">
      <h3>📖 Flipbook Preview</h3>
      <div class="binding-toggle">
        <label>
          <input type="radio" value="folded" v-model="localBindingType" @change="updateBinding" />
          <span>Folded (Tab Binding)</span>
        </label>
        <label>
          <input type="radio" value="flat" v-model="localBindingType" @change="updateBinding" />
          <span>Flat Binding</span>
        </label>
      </div>
    </div>

    <div class="flipbook-viewer">
      <div class="book-container" :style="bookContainerStyle">
        <div class="book" ref="bookElement">
          <!-- Static left page (shows back of previous right page) -->
          <div class="page-left" v-if="currentSpreadIndex > 0">
            <div class="page-content" v-html="getLeftPagePreview()"></div>
          </div>
          
          <!-- Flippable right pages -->
          <div
            v-for="(spread, index) in spreads"
            :key="index"
            class="page-right"
            :class="{ 
              'flipped': index < currentSpreadIndex,
              'current': index === currentSpreadIndex,
            }"
            :style="getRightPageStyle(index)"
            @click="flipToSpread(index)"
          >
            <!-- Front (visible before flip) -->
            <div class="page-front">
              <div class="page-content" v-html="getPagePreview(spread, 'right')"></div>
            </div>
            <!-- Back (visible after flip) -->
            <div class="page-back">
              <div class="page-content" v-html="getPagePreview(spread, 'left')"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div class="flipbook-controls">
        <button class="nav-btn" @click="previousSpread" :disabled="currentSpreadIndex === 0">
          ← Previous
        </button>
        <span class="page-indicator">
          Spread {{ currentSpreadIndex + 1 }} / {{ spreads.length }}
        </span>
        <button class="nav-btn" @click="nextSpread" :disabled="currentSpreadIndex === spreads.length - 1">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useZineStore } from '../stores/zineStore'
import html2canvas from 'html2canvas'

const zineStore = useZineStore()
const currentSpreadIndex = ref(0)
const localBindingType = ref(zineStore.zineConfig?.bindingType || 'folded')

const updateBinding = () => {
  if (zineStore.zineConfig) {
    zineStore.zineConfig.bindingType = localBindingType.value
  }
}

// Store for rendered page images
const pageImages = ref({})

// Calculate spreads based on binding type
const spreads = computed(() => {
  const pages = zineStore.pages
  if (!pages.length) return []

  if (localBindingType.value === 'folded') {
    // Folded: one editor page becomes a folded sheet with 2 pages
    // When folded vertically: right half = odd page, left half = even page
    const result = []
    for (let i = 0; i < pages.length; i++) {
      result.push({
        sheetPage: pages[i], // The original editor page that gets folded
        leftPage: (i * 2) + 2, // Page number on left side after fold
        rightPage: (i * 2) + 1, // Page number on right side after fold
      })
    }
    return result
  } else {
    // Flat: each page is separate
    return pages.map((page, i) => ({
      sheetPage: page,
      leftPage: null,
      rightPage: i + 1,
    }))
  }
})

const bookContainerStyle = computed(() => {
  const cfg = zineStore.zineConfig
  if (!cfg) return {}
  
  // Calculate aspect ratio for book
  const pageWidth = cfg.width
  const pageHeight = cfg.height
  const spreadWidth = localBindingType.value === 'folded' ? pageWidth * 2 : pageWidth
  
  return {
    width: '100%',
    height: '0',
    paddingBottom: `${(pageHeight / spreadWidth) * 100}%`,
    position: 'relative',
  }
})

const getRightPageStyle = (index) => {
  const baseZIndex = spreads.value.length - index
  const rotation = index < currentSpreadIndex.value ? -180 : 0
  
  return {
    zIndex: baseZIndex,
    transform: `rotateY(${rotation}deg)`,
  }
}

const getLeftPagePreview = () => {
  if (currentSpreadIndex.value === 0) return ''
  const prevSpread = spreads.value[currentSpreadIndex.value - 1]
  return getPagePreview(prevSpread, 'left')
}

// Capture page content as image
const capturePage = async (pageId) => {
  await nextTick()
  const pageElement = document.querySelector(`.page-canvas[data-page-id="${pageId}"]`)
  if (!pageElement) return null
  
  try {
    pageElement.classList.add('export-mode')
    const guidesElement = pageElement.querySelector('.guides')
    if (guidesElement) guidesElement.style.display = 'none'
    
    const canvas = await html2canvas(pageElement, {
      scale: 0.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0
    })
    
    if (guidesElement) guidesElement.style.display = ''
    pageElement.classList.remove('export-mode')
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error capturing page:', error)
    return null
  }
}

// Render all pages
const renderPages = async () => {
  for (const page of zineStore.pages) {
    const imgData = await capturePage(page.id)
    if (imgData) {
      pageImages.value[page.id] = imgData
    }
  }
}

const getPagePreview = (spread, side) => {
  if (!spread.sheetPage) return '<div class="empty-page">Empty</div>'
  
  const imgData = pageImages.value[spread.sheetPage.id]
  if (imgData) {
    const pageNum = side === 'right' ? spread.rightPage : spread.leftPage
    
    // For folded: each page shows half of the full image
    // Image needs to be 200% to span both pages, then positioned to show correct half
    if (localBindingType.value === 'folded') {
      const bgPosition = side === 'right' ? '0% 0%' : '100% 0%'
      return `
        <div class="page-preview-with-image" style="background-image: url(${imgData}); background-size: 200% 100%; background-position: ${bgPosition}; background-repeat: no-repeat;">
          <div class="page-number-badge">${pageNum}</div>
        </div>
      `
    } else {
      // For flat: each page shows the full image
      return `
        <div class="page-preview-with-image" style="background-image: url(${imgData}); background-size: cover; background-position: center; background-repeat: no-repeat;">
          <div class="page-number-badge">${pageNum}</div>
        </div>
      `
    }
  }
  
  const pageNum = side === 'right' ? spread.rightPage : spread.leftPage
  return `<div class="page-preview"><div class="page-number">Page ${pageNum}</div></div>`
}

const nextSpread = () => {
  if (currentSpreadIndex.value < spreads.value.length - 1) {
    currentSpreadIndex.value++
  }
}

const previousSpread = () => {
  if (currentSpreadIndex.value > 0) {
    currentSpreadIndex.value--
  }
}

const flipToSpread = (index) => {
  currentSpreadIndex.value = index
}

// Render pages on mount
onMounted(async () => {
  await renderPages()
})

// Reset when pages change
watch(() => zineStore.pages.length, () => {
  currentSpreadIndex.value = 0
  renderPages()
})

// Re-render when binding type changes
watch(() => localBindingType.value, () => {
  currentSpreadIndex.value = 0
})
</script>

<style scoped>
.flipbook-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius);
}

.flipbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.flipbook-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-strong);
}

.binding-toggle {
  display: flex;
  gap: 20px;
}

.binding-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
}

.binding-toggle input[type="radio"] {
  cursor: pointer;
}

.flipbook-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
}

.book-container {
  max-width: 800px;
  perspective: 2000px;
  perspective-origin: 50% 50%;
}

.book {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  display: flex;
}

.page-left {
  position: absolute;
  left: 0;
  width: 50%;
  height: 100%;
  background: white;
  border: 1px solid #ddd;
  box-shadow: -4px 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 4px 0 0 4px;
}

.page-right {
  position: absolute;
  left: 50%;
  width: 50%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
  cursor: pointer;
}

.page-right:hover:not(.flipped) {
  filter: brightness(1.05);
}

.page-right .page-front,
.page-right .page-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 0 4px 4px 0;
}

.page-right .page-front {
  transform: rotateY(0deg);
}

.page-right .page-back {
  transform: rotateY(180deg);
  border-radius: 4px 0 0 4px;
}

.page-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 4px;
}

.page-preview-with-image {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 4px;
}

.page-number {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-muted);
  opacity: 0.3;
}

.page-number-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.empty-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-style: italic;
  opacity: 0.5;
}

.page-spread.flipped {
  transform: rotateY(-180deg);
}

.flipbook-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--muted);
  border-radius: var(--radius);
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel-bg-solid);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.nav-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 150px;
  text-align: center;
}
</style>
