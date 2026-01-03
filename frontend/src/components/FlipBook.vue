<template>
  <div class="flipbook-overlay" @click.self="$emit('close')">
    <button class="close-btn" @click.stop="$emit('close')" title="Close">✕</button>
    
    <div class="flipbook-viewer">
      <div v-if="isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>Rendering high-quality pages...</p>
        <p class="loading-detail" v-if="loadingProgress">{{ loadingProgress }}</p>
      </div>
      <div v-else class="book-container" :style="bookContainerStyle" data-debug="book-container">
        <div class="book" :class="{ 'open': currentPageIndex > 0 && currentPageIndex <= zineStore.pages.length }" ref="bookElement">
          <!-- The book spine/crease (only visible when book is open, not on back cover) -->
          <div v-if="currentPageIndex > 0 && currentPageIndex <= zineStore.pages.length" class="book-spine"></div>
          
          <!-- Static left page is not needed - the back of flipped pages shows the left content -->
          <!-- <div v-if="currentPageIndex > 0" class="page-left">
            <div class="page-content" v-html="leftPageContent"></div>
          </div> -->
          
          <!-- Cover page (index 0) -->
          <div
            class="page-right"
            :class="{ 
              'flipped': 0 < currentPageIndex,
              'current': 0 === currentPageIndex,
              'closed-book': currentPageIndex === 0
            }"
            :style="getRightPageStyle(0)"
            @click="flipToPage(1)"
          >
            <div class="page-front">
              <div class="page-content" v-html="rightPageContents['cover-page'] || '<div class=\'cover-page\'><div class=\'cover-content\'><div class=\'cover-title\'>Loading...</div></div></div>'"></div>
            </div>
            <div class="page-back">
              <div class="page-content" v-html="backPageContents['cover-page'] || ''"></div>
            </div>
          </div>
          
          <!-- Editor pages (starting from index 1) -->
          <div
            v-for="(page, index) in flipbookPages"
            :key="page.id"
            class="page-right"
            :class="{ 
              'flipped': (index + 1) < currentPageIndex,
              'current': (index + 1) === currentPageIndex,
            }"
            :style="getRightPageStyle(index + 1)"
            @click="flipToPage(index + 2)"
          >
            <!-- Front (right half of page) -->
            <div class="page-front">
              <div class="page-content" v-html="rightPageContents[page.id] || ''"></div>
            </div>
            <!-- Back (left half of next page OR back cover if last page) -->
            <div class="page-back">
              <div class="page-content" v-html="backPageContents[page.id] || ''"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Controls -->
      <div class="flipbook-controls">
        <button class="nav-btn" @click="previousPage" :disabled="currentPageIndex === 0">
          ← Previous
        </button>
        <span class="page-indicator">
          {{ currentPageIndex === 0 ? 'Front Cover' : currentPageIndex > flipbookPages.length ? 'Back Cover' : `Page ${currentPageIndex} / ${flipbookPages.length}` }}
        </span>
        <button class="nav-btn" @click="nextPage" :disabled="currentPageIndex > flipbookPages.length">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useZineStore } from '../stores/zineStore'
import html2canvas from 'html2canvas'
import { handleObjectPositionForExport, restoreObjectPositionAfterExport } from '../utils/pdfExport'

const emit = defineEmits(['close'])

const zineStore = useZineStore()
const currentPageIndex = ref(0)
const isLoading = ref(true)
const loadingProgress = ref('')

// Total pages including front cover and editor pages (back cover is on the back of last page)
const totalPages = computed(() => {
  if (isFoldedMode.value) {
    return zineStore.pages.length + 1
  } else {
    // Flat mode: count only the flipbook pages we're rendering
    return Math.ceil(zineStore.pages.length / 2) + 1
  }
})

// Store for rendered page images
const pageImages = ref({})
const rightPageContents = ref({})
const backPageContents = ref({})

const bookContainerStyle = computed(() => {
  const cfg = zineStore.zineConfig
  const pageIdx = currentPageIndex.value // Force reactivity
  
  if (!cfg) return {}
  
  const folded = isFoldedMode.value
  
  // Editor page dimensions
  // Folded: cfg.width is the FULL SPREAD (e.g., 148mm), each page is width/2 (74mm)
  // Flat: cfg.width is ONE PAGE (e.g., 100mm), full spread would be width*2 (200mm)
  const editorPageWidth = cfg.width
  const height = cfg.height
  
  // Calculate actual book dimensions
  let fullSpreadWidth, singlePageWidth
  if (folded) {
    // Folded: editor width IS the full spread, single page is half
    fullSpreadWidth = editorPageWidth  // 148mm
    singlePageWidth = editorPageWidth / 2  // 74mm
  } else {
    // Flat: editor width IS a single page, spread is double
    singlePageWidth = editorPageWidth  // 100mm
    fullSpreadWidth = editorPageWidth * 2  // 200mm
  }
  
  // Calculate display dimensions
  // Scale to fit nicely on screen while maintaining aspect ratio
  // Flat mode gets 1.5x larger display since pages are bigger
  const maxDisplayWidth = folded ? 800 : 1200 // Max width for open book spread
  const scale = maxDisplayWidth / fullSpreadWidth
  
  // Display dimensions
  const openWidthPx = fullSpreadWidth * scale  // 600px for spread
  const closedWidthPx = singlePageWidth * scale  // 300px for single page
  const displayHeightPx = height * scale
  
  // Check if we're on back cover (beyond all flipbook pages)
  const isBackCover = pageIdx > flipbookPages.value.length
  
  let translateX, clipPath
  if (pageIdx === 0) {
    // Front cover: book is closed, spine should be on left edge
    // Move book left by a page width so spine aligns with left edge
    if (folded) {
      // Folded: clip left half, move spine to left edge
      translateX = -closedWidthPx/2
      clipPath = `inset(0 0 0 50%)`  // Hide left half
    } else {
      // Flat: move spine to left edge
      translateX = -closedWidthPx/2
      clipPath = 'none'
    }
  } else if (isBackCover) {
    // Back cover: book is closed, spine should be on right edge
    // Move book right by a page width so spine aligns with right edge
    translateX = closedWidthPx/2
    clipPath = 'none'
  } else {
    // Open book: spine in center, no translation
    translateX = 0
    clipPath = 'none'
  }
  
  return {
    width: `${openWidthPx}px`,
    height: `${displayHeightPx}px`,
    position: 'relative',
    transform: `translateX(${translateX}px)`,
    clipPath,
    // Smooth transition for transform (centering) and clip-path
    // Delay clip-path when closing to front cover to let page flip complete
    transition: pageIdx === 0 
      ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, clip-path 0.01s 0.8s'
      : isBackCover
        ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, clip-path 0.01s'
        : 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), clip-path 0.01s',
  }
})

const getRightPageStyle = (index) => {
  const totalPagesCount = zineStore.pages.length + 2 // +1 for front cover, +1 for back cover
  
  // Z-index logic:
  // - Current page should be on top
  // - Future pages stacked below current (further pages lower)
  // - Flipped pages behind everything (most recent flip on top)
  let zIndex
  if (index === currentPageIndex.value) {
    // Current page: highest z-index
    zIndex = totalPagesCount * 2
  } else if (index < currentPageIndex.value) {
    // Flipped pages: lower z-index, most recent flip on top
    zIndex = index
  } else {
    // Future pages: medium z-index, furthest page lowest
    zIndex = totalPagesCount * 2 - (index - currentPageIndex.value)
  }
  
  const rotation = index < currentPageIndex.value ? -180 : 0
  
  return {
    zIndex,
    transform: `rotateY(${rotation}deg)`,
  }
}

// Computed property for left page content
const leftPageContent = computed(() => {
  // Left page only shows when book is open (currentPageIndex > 0)
  // It shows the LEFT HALF of the current editor page
  const pageIdx = currentPageIndex.value
  if (pageIdx === 0) return '' // No left page when closed
  
  // currentPageIndex 1 = editor page 0, currentPageIndex 2 = editor page 1, etc.
  const editorPageIndex = pageIdx - 1
  const currentPage = zineStore.pages[editorPageIndex]
  if (!currentPage) return ''
  
  const imgData = pageImages.value[currentPage.id]
  if (imgData) {
    return `
      <div class="page-preview-with-image">
        <img src="${imgData}" style="width: 200%; height: 100%; object-fit: cover; object-position: 0% 0%;" />
      </div>
    `
  }
  
  return '<div class="page-preview"><div class="page-number">Left</div></div>'
})

// Check if we're in folded mode (pages are split in half)
const isFoldedMode = computed(() => {
  return zineStore.zineConfig?.bindingType === 'folded'
})

// Get pages to render in flipbook
// Folded: all pages (each split into left/right)
// Flat: only even-indexed pages (pages are paired), plus dummy for odd count
const flipbookPages = computed(() => {
  if (isFoldedMode.value) {
    return zineStore.pages
  } else {
    // Flat mode: only render pages that have rightPageContents
    const pages = zineStore.pages.filter(page => rightPageContents.value[page.id])
    
    // Add dummy page for odd number of pages
    if (zineStore.pages.length % 2 === 1) {
      const lastPage = zineStore.pages[zineStore.pages.length - 1]
      pages.push({ id: 'empty-page-' + lastPage.id, isEmpty: true })
    }
    
    return pages
  }
})

// Generate right page contents for all pages
const generatePageContents = () => {
  const rightContents = {}
  const backContents = {}
  const folded = isFoldedMode.value
  
  // Add front cover as page 0 (not from editor)
  const coverPageId = 'cover-page'
  const title = zineStore.projectMeta?.title || 'Untitled Zine'
  const pageCount = zineStore.pages.length
  
  rightContents[coverPageId] = `
    <div class="cover-page">
      <div class="cover-content">
        <div class="cover-title">${title}</div>
        <div class="cover-meta">${pageCount} page${pageCount !== 1 ? 's' : ''}</div>
      </div>
    </div>
  `
  
  // Back of cover shows left half of first editor page (folded) or first full page (flat)
  if (zineStore.pages.length > 0) {
    const firstPage = zineStore.pages[0]
    const firstImgData = pageImages.value[firstPage.id]
    if (firstImgData) {
      if (folded) {
        // Folded: show left half of first page
        backContents[coverPageId] = `
          <div class="page-preview-with-image">
            <img src="${firstImgData}" style="width: 200%; height: 100%; object-fit: cover; object-position: 0% 0%;" />
          </div>
        `
      } else {
        // Flat: show full first page
        backContents[coverPageId] = `
          <div class="page-preview-with-image">
            <img src="${firstImgData}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
          </div>
        `
      }
    }
  }
  
  // Map editor pages starting from index 0
  if (folded) {
    // FOLDED MODE: Each editor page is split into left/right halves
    zineStore.pages.forEach((page, index) => {
      const imgData = pageImages.value[page.id]
      
      // Right page shows the RIGHT HALF
      if (imgData) {
        rightContents[page.id] = `
          <div class="page-preview-with-image">
            <img src="${imgData}" style="width: 200%; height: 100%; object-fit: cover; object-position: 100% 0%; margin-left: -100%;" />
          </div>
        `
      } else {
        rightContents[page.id] = '<div class="page-preview"><div class="page-number">Page ' + (index + 1) + '</div></div>'
      }
      
      // Back of this page shows the LEFT HALF of NEXT page
      const nextIndex = index + 1
      if (nextIndex >= zineStore.pages.length) {
        // Last editor page: back shows back cover
        backContents[page.id] = `
          <div class="cover-page back-cover">
            <div class="cover-content">
              <div class="cover-title">The End</div>
              <div class="cover-meta">Created with Zino</div>
            </div>
          </div>
        `
      } else {
        const nextPage = zineStore.pages[nextIndex]
        const nextImgData = pageImages.value[nextPage.id]
        if (nextImgData) {
          backContents[page.id] = `
            <div class="page-preview-with-image">
              <img src="${nextImgData}" style="width: 200%; height: 100%; object-fit: cover; object-position: 0% 0%;" />
            </div>
          `
        } else {
          backContents[page.id] = '<div class="page-preview"><div class="page-number">Page ' + (nextIndex + 1) + '</div></div>'
        }
      }
    })
  } else {
    // FLAT MODE: Each editor page is a full page
    // Pages are paired: [1-left, 2-right], [3-left, 4-right], etc.
    // We iterate by pairs and only create flipbook pages for even-numbered pages
    for (let i = 0; i < zineStore.pages.length; i += 2) {
      const leftPageIndex = i      // Page 1, 3, 5... (index 0, 2, 4...)
      const rightPageIndex = i + 1 // Page 2, 4, 6... (index 1, 3, 5...)
      
      const leftPage = zineStore.pages[leftPageIndex]
      const rightPage = zineStore.pages[rightPageIndex]
      
      // We use the RIGHT page as the key for the flipbook page
      // because it's the one that flips
      if (rightPage) {
        const rightImgData = pageImages.value[rightPage.id]
        
        // Right side shows the right page
        if (rightImgData) {
          rightContents[rightPage.id] = `
            <div class="page-preview-with-image">
              <img src="${rightImgData}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
            </div>
          `
        } else {
          rightContents[rightPage.id] = '<div class="page-preview"><div class="page-number">Page ' + (rightPageIndex + 1) + '</div></div>'
        }
        
        // Back shows the NEXT left page OR back cover
        const nextLeftPageIndex = i + 2
        const nextLeftPage = zineStore.pages[nextLeftPageIndex]
        
        if (nextLeftPage) {
          const nextLeftImgData = pageImages.value[nextLeftPage.id]
          if (nextLeftImgData) {
            backContents[rightPage.id] = `
              <div class="page-preview-with-image">
                <img src="${nextLeftImgData}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
              </div>
            `
          } else {
            backContents[rightPage.id] = '<div class="page-preview"><div class="page-number">Page ' + (nextLeftPageIndex + 1) + '</div></div>'
          }
        } else {
          // No more pages - show back cover
          backContents[rightPage.id] = `
            <div class="cover-page back-cover">
              <div class="cover-content">
                <div class="cover-title">The End</div>
                <div class="cover-meta">Created with Zino</div>
              </div>
            </div>
          `
        }
      }
      
      // Handle odd number of pages - add an extra flipbook page
      if (zineStore.pages.length % 2 === 1) {
        const lastPage = zineStore.pages[zineStore.pages.length - 1]
        const lastImgData = pageImages.value[lastPage.id]
        
        // Create a dummy page ID for the empty page spread
        const emptyPageId = 'empty-page-' + lastPage.id
        
        // Right side shows empty page
        rightContents[emptyPageId] = `
          <div class="page-preview">
            <div class="empty-page">Empty Page</div>
          </div>
        `
        
        // Back shows back cover
        backContents[emptyPageId] = `
          <div class="cover-page back-cover">
            <div class="cover-content">
              <div class="cover-title">The End</div>
              <div class="cover-meta">Created with Zino</div>
            </div>
          </div>
        `
        
        // Add this to the pages list (we'll need to track it)
        // Actually, we need to add a dummy page object
      }
    }
  }
  
  // Back cover is shown on the back of the last editor page, no separate page needed
  
  rightPageContents.value = rightContents
  backPageContents.value = backContents
}

// Capture page content as image
const capturePage = async (pageId) => {
  await nextTick()
  const pageElement = document.querySelector(`.page-canvas[data-page-id="${pageId}"]`)
  if (!pageElement) return null
  
  try {
    pageElement.classList.add('export-mode')
    
    // Handle images with object-fit: cover and custom positioning
    const images = pageElement.querySelectorAll('img')
    for (const img of images) {
      await handleObjectPositionForExport(img)
    }
    
    const guidesElement = pageElement.querySelector('.guides')
    const creaseElement = pageElement.querySelector('.page-crease')
    if (guidesElement) guidesElement.style.display = 'none'
    if (creaseElement) creaseElement.style.display = 'none'
    
    const canvas = await html2canvas(pageElement, {
      scale: 2, // Higher resolution for better image quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 0,
      removeContainer: true // Clean up temporary elements
    })
    
    if (guidesElement) guidesElement.style.display = ''
    if (creaseElement) creaseElement.style.display = ''
    
    // Restore image positioning
    await restoreObjectPositionAfterExport(pageElement)
    
    pageElement.classList.remove('export-mode')
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error capturing page:', error)
    return null
  }
}

// Render all pages in parallel for faster loading
const renderPages = async () => {
  isLoading.value = true
  loadingProgress.value = ''
  pageImages.value = {}
  
  const totalPages = zineStore.pages.length
  
  // Render pages in parallel with concurrency limit to avoid overwhelming browser
  const concurrency = 3 // Render 3 pages at a time
  const results = {}
  
  for (let i = 0; i < totalPages; i += concurrency) {
    const batch = zineStore.pages.slice(i, i + concurrency)
    loadingProgress.value = `Rendering pages ${i + 1}-${Math.min(i + concurrency, totalPages)} of ${totalPages}`
    
    // Render batch in parallel
    const batchPromises = batch.map(page => capturePage(page.id))
    const batchResults = await Promise.all(batchPromises)
    
    // Store results
    batch.forEach((page, index) => {
      if (batchResults[index]) {
        results[page.id] = batchResults[index]
      }
    })
  }
  
  pageImages.value = results
  generatePageContents()
  isLoading.value = false
}

const nextPage = () => {
  // Allow going one past flipbookPages.length to show back cover
  if (currentPageIndex.value <= flipbookPages.value.length) {
    currentPageIndex.value++
  }
}

const previousPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}

const flipToPage = (index) => {
  if (index >= 0 && index < flipbookPages.value.length) {
    currentPageIndex.value = index
  }
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    nextPage()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    previousPage()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}

// Render pages on mount and regenerate each time
onMounted(async () => {
  currentPageIndex.value = 0
  await renderPages()
  window.addEventListener('keydown', handleKeydown)
})

// Cleanup on unmount
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Reset and regenerate when pages change
watch(() => zineStore.pages.length, () => {
  currentPageIndex.value = 0
  renderPages()
})

// Regenerate when component is shown (in case pages were edited)
watch(() => zineStore.pages, () => {
  renderPages()
}, { deep: true })
</script>

<style>
.flipbook-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(12px);
  }
}

.close-btn {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10001;
  padding: 0;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  color: #333;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

.close-btn:hover {
  background: white;
  transform: scale(1.15) rotate(90deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 0, 0, 0.2);
}

.close-btn:active {
  transform: scale(1.05) rotate(90deg);
}

.flipbook-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-size: 16px;
  color: var(--text-muted);
  gap: 16px;
}

.loading-message p {
  margin: 0;
  font-weight: 500;
}

.loading-detail {
  font-size: 14px;
  color: var(--accent);
  font-weight: 600;
}

.loading-spinner {
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

.book-container {
  perspective: 2000px;
  perspective-origin: 50% 50%;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}

.book {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  display: flex;
  /* Book depth effect - visible page edges (right side only when closed) */
  box-shadow: 
    /* Right edge pages */
    4px 0 0 -1px rgba(0, 0, 0, 0.1),
    5px 0 0 -1px rgba(0, 0, 0, 0.08),
    6px 0 0 -1px rgba(0, 0, 0, 0.06),
    7px 0 0 -1px rgba(0, 0, 0, 0.04),
    8px 0 0 -1px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s; /* 0.5s delay */
}

/* When book is open, show left edge pages too */
.book.open {
  box-shadow: 
    /* Right edge pages */
    4px 0 0 -1px rgba(0, 0, 0, 0.1),
    5px 0 0 -1px rgba(0, 0, 0, 0.08),
    6px 0 0 -1px rgba(0, 0, 0, 0.06),
    7px 0 0 -1px rgba(0, 0, 0, 0.04),
    8px 0 0 -1px rgba(0, 0, 0, 0.02),
    /* Left edge pages */
    -4px 0 0 -1px rgba(0, 0, 0, 0.1),
    -5px 0 0 -1px rgba(0, 0, 0, 0.08),
    -6px 0 0 -1px rgba(0, 0, 0, 0.06),
    -7px 0 0 -1px rgba(0, 0, 0, 0.04),
    -8px 0 0 -1px rgba(0, 0, 0, 0.02);
}

/* Book spine/crease in the center */
.book-spine {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 6px;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.05) 10%,
    rgba(0, 0, 0, 0.15) 30%,
    rgba(0, 0, 0, 0.25) 50%,
    rgba(0, 0, 0, 0.15) 70%,
    rgba(0, 0, 0, 0.05) 90%,
    transparent 100%
  );
  box-shadow: 
    -2px 0 4px rgba(0, 0, 0, 0.15),
    2px 0 4px rgba(255, 255, 255, 0.4),
    inset -2px 0 3px rgba(0, 0, 0, 0.25),
    inset 2px 0 3px rgba(255, 255, 255, 0.3);
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
  overflow: hidden;
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
  /* Prevent width from changing when container resizes */
  box-sizing: border-box;
}

/* When book is closed on front cover, page stays on right side */
.page-right.closed-book {
  left: 50%;
  width: 50%;
}

/* When book is closed on back cover, page stays on left side */
.page-right.closed-book.back-cover-page {
  left: 0;
  width: 50%;
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
  border: 1px solid #e0e0e0;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
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

.cover-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 50%, rgba(255,255,255,0.05) 100%),
    linear-gradient(90deg, #2c3e50 0%, #34495e 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 50px rgba(0, 0, 0, 0.3),
    inset 0 2px 1px rgba(255, 255, 255, 0.1);
}

/* Hardcover texture */
.cover-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  opacity: 0.5;
  pointer-events: none;
}

/* Subtle shine effect */
.cover-page::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.cover-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 30px;
  max-width: 85%;
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.cover-title {
  font-size: 28px;
  font-weight: 800;
  color: #f8f9fa;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 12px;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(255, 255, 255, 0.1);
  line-height: 1.3;
  word-wrap: normal;
  font-family: 'Georgia', serif;
}

.cover-meta {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  text-transform: uppercase;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
  margin-top: 12px;
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
