<template>
  <div class="canvas-container">
    <div v-if="!props.isTemplatePreview" class="toolbar" :class="{ collapsed: toolbarCollapsed }">
      <div class="toolbar-header">
        <div class="toolbar-mode-tabs">
          <button 
            class="mode-tab" 
            :class="{ active: toolbarMode === 'layouts' }"
            @click="toolbarMode = 'layouts'; toolbarCollapsed = false"
          >
            <span class="mode-icon">📐</span>
            <span>Page Layouts</span>
          </button>
          <button 
            class="mode-tab" 
            :class="{ active: toolbarMode === 'settings' }"
            @click="toolbarMode = 'settings'; toolbarCollapsed = false"
          >
            <span class="mode-icon">⚙️</span>
            <span>Page Settings</span>
          </button>
        </div>
        <div class="toolbar-actions">
          <label class="toggle-guides">
            <input type="checkbox" v-model="showGuides" />
            <span>Show Guides</span>
          </label>
          <label class="toggle-guides">
            <input type="checkbox" v-model="showPrintGuides" />
            <span>Print Guides</span>
          </label>
          <label class="toggle-guides">
            <input type="checkbox" v-model="showPageNumbers" />
            <span>Page Numbers</span>
          </label>
          <button class="collapse-btn" @click="toolbarCollapsed = !toolbarCollapsed" :title="toolbarCollapsed ? 'Expand' : 'Collapse'">
            {{ toolbarCollapsed ? '▼' : '▲' }}
          </button>
        </div>
      </div>
      <transition name="toolbar-expand">
        <div v-if="!toolbarCollapsed" class="toolbar-content">
          <!-- Page Layouts Mode -->
          <div v-if="toolbarMode === 'layouts'" class="toolbar-mode-content">
            <div class="toolbar-tabs">
              <button
                v-for="(category, key) in categories"
                :key="key"
                class="category-tab"
                :class="{ active: activeCategory === key }"
                @click="activeCategory = key"
              >
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>
            <div class="toolbar-layouts">
              <transition name="layouts-fade" mode="out-in">
                <div :key="activeCategory" class="layouts-grid">
                  <button
                    v-for="layout in categories[activeCategory].layouts"
                    :key="layout.id"
                    class="layout-btn"
                    @click="addPageWithLayout(layout)"
                    :title="layout.name"
                  >
                    <div class="layout-preview-mini">
                      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        <rect
                          v-for="(slot, index) in (layout.slots || []).filter(s => !s.shape || s.shape === 'rectangle')"
                          :key="`rect-${index}`"
                          :x="slot.x || 0"
                          :y="slot.y || 0"
                          :width="slot.width || 100"
                          :height="slot.height || 100"
                          fill="rgba(99, 102, 241, 0.3)"
                          stroke="#6366f1"
                          stroke-width="1"
                        />
                        <polygon
                          v-for="(slot, index) in (layout.slots || []).filter(s => s.shape === 'polygon')"
                          :key="`poly-${index}`"
                          :points="slot.points.map(p => `${p.x},${p.y}`).join(' ')"
                          fill="rgba(99, 102, 241, 0.3)"
                          stroke="#6366f1"
                          stroke-width="1"
                        />
                      </svg>
                    </div>
                    <span class="layout-name">{{ layout.name }}</span>
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <!-- Page Settings Mode -->
          <div v-else-if="toolbarMode === 'settings'" class="toolbar-mode-content">
            <PageSettings />
          </div>
        </div>
      </transition>
    </div>

    <div class="canvas-workspace" :class="scaleClass" :style="{ '--scale-factor': scaleFactor }" :data-theme="zineStore.ui.theme">
      <div v-if="zineStore.pages.length === 0" class="empty-canvas">
        <div class="empty-message">
          <h3>👆 Select a layout above to create your first page</h3>
          <p>Choose from various page layouts to start building your zine</p>
        </div>
      </div>

      <div v-else class="pages-container">
        <transition-group name="page-fade" tag="div" class="pages-stack" :class="{ 'spread-view': isSpreadView }">
          <div
            v-for="(page, index) in zineStore.pages"
            :key="page.id"
            class="page-wrapper"
            :class="scaleClass"
          >
            <!-- Page number chips (not printed) -->
            <div v-if="showPageNumbers" class="page-numbers no-print">
              <template v-if="zineStore.zineConfig?.bindingType === 'folded'">
                <!-- Folded: show two page numbers (left and right) -->
                <div class="page-number-chip left">{{ (index * 2) + 1 }}</div>
                <div class="page-number-chip right">{{ (index * 2) + 2 }}</div>
              </template>
              <template v-else>
                <!-- Flat: show single page number -->
                <div class="page-number-chip single">{{ index + 1 }}</div>
              </template>
            </div>
            
            <div
              class="page page-canvas"
              :class="{ active: page.id === zineStore.selectedPageId }"
              :style="pageStyle"
              :data-page-id="page.id"
              @click="zineStore.selectPage(page.id)"
              @contextmenu.prevent="openPageContextMenu(page)"
              @dragover.prevent="handlePageDragOver"
              @drop="handlePageDrop($event, page.id)"
            >
            <div v-if="zineStore.ui.showGuides" class="guides">
              <div class="guide guide-bleed" :style="bleedGuideStyle"></div>
              <div class="guide guide-fold"></div>
            </div>
            <div v-if="zineStore.ui.showPrintGuides" class="print-guides">
              <div class="guide guide-gutter-top" :style="gutterGuideStyle('top')"></div>
              <div class="guide guide-gutter-bottom" :style="gutterGuideStyle('bottom')"></div>
              <div class="guide guide-gutter-left" :style="gutterGuideStyle('left')"></div>
              <div class="guide guide-gutter-right" :style="gutterGuideStyle('right')"></div>
            </div>
            <!-- Center crease effect (only for folded binding) -->
            <div class="page-crease" v-if="zineStore.zineConfig?.bindingType === 'folded'"></div>
            <div class="page-inner" :style="pageInnerStyle">
              <!-- Image slots -->
              <div
                v-for="(slot, index) in page.slots"
                :key="index"
                class="slot"
                :class="{ 
                  selected: selectedSlot?.pageId === page.id && selectedSlot?.index === index,
                  'hide-guides': !showGuides
                }"
                :style="getSlotStyle(slot, page)"
                @dragover.prevent="handleDragOver"
                @drop="handleDrop($event, page.id, index)"
                @click.stop="selectSlot(page.id, index)"
              >
                <!-- Outer margin guide (shows slot boundary with margin) -->
                <div v-if="zineStore.ui.showGuides && zineStore.zineConfig?.margin" class="slot-outer-margin-guide"></div>
                <!-- Inner margin guide (padding inside slot) -->
                <div v-if="zineStore.ui.showGuides && slot.innerMarginPx > 0" class="slot-inner-margin-guide" :style="{ inset: `${slot.innerMarginPx}px` }"></div>
                <div class="slot-inner" :style="getSlotInnerStyle(slot)">
                  <div v-if="slot.assetId" class="slot-image-wrapper" :class="slot.fit">
                    <img
                      class="slot-image"
                      :class="{ 'repositionable': slot.fit === 'cover' }"
                      :src="getAssetUrl(slot.assetId)"
                      :style="getImageStyle(slot)"
                      :data-slot-id="`${page.id}-${index}`"
                      :data-fit="slot.fit"
                      crossorigin="anonymous"
                      @load="handleImageLoad($event, slot)"
                      @mousedown.stop="slot.fit === 'cover' ? startImageDrag($event, page.id, index, slot) : null"
                      alt="Slot image"
                      draggable="false"
                    />
                  </div>
                  <div 
                    v-else 
                    class="slot-placeholder export-hide"
                    :class="{ 'has-background': slot.backgroundColor }"
                  >
                    <span>{{ slot.backgroundColor ? '' : 'Drop image or set color' }}</span>
                  </div>
                </div>
              </div>
              <!-- Floating text elements -->
              <FloatingTextBox
                v-for="textEl in page.textElements"
                :key="textEl.id"
                :element="textEl"
                :pageId="page.id"
                :pageWidth="pageWidthPx"
                :pageHeight="pageHeightPx"
                @update="(updates) => updateTextElement(page.id, textEl.id, updates)"
                @edit="selectTextElement(page.id, textEl.id)"
                @delete="deleteTextElement(page.id, textEl.id)"
                @editing-change="handleTextEditingChange"
              />
            </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
    <TextToolbar
      :isVisible="textToolbarVisible"
      :textStyle="currentTextStyle"
      :position="textToolbarPosition"
      @update:textStyle="updateTextStyle"
      @applyPreset="applyTextPreset"
      @bring-to-front="bringTextToFront"
      @send-to-back="sendTextToBack"
    />
    
    <ElementContextMenu
      :is-visible="contextMenuVisible"
      :selected-element="selectedElement"
      :element-type="selectedElementType"
      :position="contextMenuPosition"
      :page-number="selectedPageNumber"
      :slot-index="selectedSlotIndex"
      @close="closeContextMenu"
      @bring-to-front="handleContextBringToFront"
      @send-to-back="handleContextSendToBack"
      @toggle-fit="handleContextToggleFit"
      @set-background-color="handleContextSetBackgroundColor"
      @set-inner-margin="handleContextSetInnerMargin"
      @update-style="handleContextUpdateStyle"
      @toggle-lock="handleContextToggleLock"
      @delete="handleContextDelete"
      @toggle-margin-override="handleContextToggleMarginOverride"
      @set-page-margin="handleContextSetPageMargin"
      @nudge-image="handleNudgeImage"
      @reset-image-position="handleResetImagePosition"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useZineStore } from '../stores/zineStore'
import { getScaledDimensions, toScaledPx } from '../utils/unitConversion'

const props = defineProps({
  mediaPanelCollapsed: {
    type: Boolean,
    default: false
  },
  pagePanelCollapsed: {
    type: Boolean,
    default: false
  },
  isTemplatePreview: {
    type: Boolean,
    default: false
  }
})

// Computed scale factor based on collapsed panels and binding type
const scaleFactor = computed(() => {
  const bothCollapsed = props.mediaPanelCollapsed && props.pagePanelCollapsed
  const oneCollapsed = props.mediaPanelCollapsed || props.pagePanelCollapsed
  const isFlat = zineStore.zineConfig.bindingType === 'flat'

  // For flat (no fold) binding, use smaller scale factors
  if (isFlat) {
    if (bothCollapsed) return 1.2
    if (oneCollapsed) return 1.1
    return 1.0
  }

  // For folded binding, use original scale factors
  if (bothCollapsed) return 1.3
  if (oneCollapsed) return 1.2
  return 1.1
})

// Scale class for CSS (for other styling)
const scaleClass = computed(() => {
  const bothCollapsed = props.mediaPanelCollapsed && props.pagePanelCollapsed
  const oneCollapsed = props.mediaPanelCollapsed || props.pagePanelCollapsed

  if (bothCollapsed) return 'scaled-both'
  if (oneCollapsed) return 'scaled-one'
  return ''
})

// Import layout system - uses JSON files dynamically loaded via Vite
// Fallback to layoutDefinitions.js if needed during migration
import { layoutDefinitions, layoutCategories, getLayoutById } from '../layouts/layoutLoader'
import TextToolbar from '../components/TextToolbar.vue'
import FloatingTextBox from '../components/FloatingTextBox.vue'
import ElementContextMenu from '../components/ElementContextMenu.vue'
import PageSettings from '../components/PageSettings.vue'
import { createElementFromSpec } from '../utils/elementSpecs.js'

const zineStore = useZineStore()
const activeCategory = ref('basic')
const toolbarMode = ref('layouts')
const toolbarCollapsed = ref(false)
const isTextBeingEdited = ref(false)
const selectedSlot = ref(null)
// const zoom = ref(100) // Zoom level percentage - DISABLED for now
const showGuides = computed({
  get: () => zineStore.ui.showGuides,
  set: (value) => { zineStore.ui.showGuides = value }
})

const showPrintGuides = computed({
  get: () => zineStore.ui.showPrintGuides,
  set: (value) => { zineStore.ui.showPrintGuides = value }
})

const showPageNumbers = computed({
  get: () => zineStore.ui.showPageNumbers,
  set: (value) => { zineStore.ui.showPageNumbers = value }
})

// Check if we should show spread view (2 pages per row)
// Flat/stapled = spreads (side by side), Folded = single column
const isSpreadView = computed(() => zineStore.zineConfig?.bindingType !== 'folded')

// Restore deeper crease effect


// Filter layouts by enabled status
const enabledLayoutIds = ref(new Set())
const customLayouts = ref([])

const loadEnabledLayouts = () => {
  const stored = localStorage.getItem('enabledLayouts')
  if (stored) {
    enabledLayoutIds.value = new Set(JSON.parse(stored))
  } else {
    // By default, all built-in layouts are enabled
    layoutDefinitions.forEach(layout => {
      enabledLayoutIds.value.add(layout.id)
    })
  }
}

const loadCustomLayouts = async () => {
  try {
    const { listCustomLayouts } = await import('../api/layouts.js')
    const layouts = await listCustomLayouts()
    customLayouts.value = layouts
    
    // Auto-enable custom layouts that have enabled: true
    layouts.forEach(layout => {
      if (layout.enabled) {
        enabledLayoutIds.value.add(layout.id)
      }
    })
  } catch (error) {
    console.error('Failed to load custom layouts:', error)
    customLayouts.value = []
  }
}

loadEnabledLayouts()
loadCustomLayouts()

// Filter categories to only show enabled layouts (built-in + custom)
const categories = computed(() => {
  const filtered = {}
  const currentBindingType = zineStore.zineConfig?.bindingType || 'folded'
  
  Object.keys(layoutCategories).forEach(key => {
    if (key === 'custom') {
      // Custom category: use layouts from API
      const enabledCustom = customLayouts.value
        .filter(layout => enabledLayoutIds.value.has(layout.id))
      
      filtered[key] = {
        ...layoutCategories[key],
        layouts: enabledCustom
      }
    } else {
      // Built-in categories: use layouts from layoutLoader
      const enabledLayouts = layoutCategories[key].layouts
        .map(layoutId => getLayoutById(layoutId))
        .filter(layout => {
          if (!layout) return false
          
          // Check if layout is enabled
          if (!enabledLayoutIds.value.has(layout.id)) return false
          
          // Check binding type compatibility
          if (!layout.bindingTypes) return true // Backward compatibility - no bindingTypes means compatible with all
          return layout.bindingTypes.includes(currentBindingType)
        })
      
      filtered[key] = {
        ...layoutCategories[key],
        layouts: enabledLayouts
      }
    }
  })
  
  return filtered
})

// getLayoutById is imported from layoutLoader

const textToolbarVisible = ref(false)
const currentTextStyle = ref({})
const textToolbarPosition = ref({ top: 0, left: 0 })
const currentEditingElement = ref({ pageId: null, elementId: null })

// Context menu state
const contextMenuVisible = ref(false)
const selectedElement = ref(null)
const selectedElementType = ref(null)
const selectedElementRef = ref(null) // { pageId, index } or { pageId, elementId }
const contextMenuPosition = ref({ right: '320px', top: '100px' })

// Computed properties for context menu info
const selectedPageNumber = computed(() => {
  if (!selectedElementRef.value?.pageId) return undefined
  const pageIndex = zineStore.pages.findIndex(p => p.id === selectedElementRef.value.pageId)
  return pageIndex >= 0 ? pageIndex + 1 : undefined
})

const selectedSlotIndex = computed(() => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value?.index !== undefined) {
    return selectedElementRef.value.index
  }
  return undefined
})
let contextMenuTransitionTimeout = null

const pageStyle = computed(() => {
  const config = zineStore.zineConfig
  if (!config) return {}

  const { widthPx, heightPx } = getScaledDimensions(config, 600)

  // Apply scale factor to actual dimensions instead of using CSS transform
  const scaledWidth = widthPx * scaleFactor.value
  const scaledHeight = heightPx * scaleFactor.value

  return {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
  }
})

const pageInnerStyle = computed(() => {
  const cfg = zineStore.zineConfig
  if (!cfg) return {}
  
  // Get bleed values (can be different per side)
  const bleedTop = cfg.bleedTop ?? cfg.bleed ?? 0
  const bleedRight = cfg.bleedRight ?? cfg.bleed ?? 0
  const bleedBottom = cfg.bleedBottom ?? cfg.bleed ?? 0
  const bleedLeft = cfg.bleedLeft ?? cfg.bleed ?? 0
  
  // Apply only bleed insets (margins are now handled per-slot in getSlotStyle)
  const topInset = (bleedTop / cfg.height) * 100
  const rightInset = (bleedRight / cfg.width) * 100
  const bottomInset = (bleedBottom / cfg.height) * 100
  const leftInset = (bleedLeft / cfg.width) * 100
  
  return {
    position: 'absolute',
    top: `${topInset}%`,
    right: `${rightInset}%`,
    bottom: `${bottomInset}%`,
    left: `${leftInset}%`,
  }
})

const bleedGuideStyle = computed(() => {
  const cfg = zineStore.zineConfig
  if (!cfg) return {}
  
  // Support individual bleed values per side
  const bleedTop = cfg.bleedTop ?? cfg.bleed ?? 0
  const bleedRight = cfg.bleedRight ?? cfg.bleed ?? 0
  const bleedBottom = cfg.bleedBottom ?? cfg.bleed ?? 0
  const bleedLeft = cfg.bleedLeft ?? cfg.bleed ?? 0
  
  if (bleedTop === 0 && bleedRight === 0 && bleedBottom === 0 && bleedLeft === 0) {
    return {}
  }
  
  const topPercent = (bleedTop / cfg.height) * 100
  const rightPercent = (bleedRight / cfg.width) * 100
  const bottomPercent = (bleedBottom / cfg.height) * 100
  const leftPercent = (bleedLeft / cfg.width) * 100
  
  return {
    position: 'absolute',
    top: `${topPercent}%`,
    right: `${rightPercent}%`,
    bottom: `${bottomPercent}%`,
    left: `${leftPercent}%`,
  }
})

const marginGuideStyle = computed(() => {
  const cfg = zineStore.zineConfig
  if (!cfg || !cfg.margin) return {}
  
  // Get bleed values (can be different per side)
  const bleedTop = cfg.bleedTop ?? cfg.bleed ?? 0
  const bleedRight = cfg.bleedRight ?? cfg.bleed ?? 0
  const bleedBottom = cfg.bleedBottom ?? cfg.bleed ?? 0
  const bleedLeft = cfg.bleedLeft ?? cfg.bleed ?? 0
  
  // Margin guide shows the safe area, which is bleed + margin from edge
  const topInset = ((bleedTop + cfg.margin) / cfg.height) * 100
  const rightInset = ((bleedRight + cfg.margin) / cfg.width) * 100
  const bottomInset = ((bleedBottom + cfg.margin) / cfg.height) * 100
  const leftInset = ((bleedLeft + cfg.margin) / cfg.width) * 100
  
  return {
    position: 'absolute',
    top: `${topInset}%`,
    right: `${rightInset}%`,
    bottom: `${bottomInset}%`,
    left: `${leftInset}%`,
  }
})

const gutterGuideStyle = (side) => {
  const cfg = zineStore.zineConfig
  if (!cfg || !cfg.gutter) return {}
  
  // Get bleed values (can be different per side)
  const bleedTop = cfg.bleedTop ?? cfg.bleed ?? 0
  const bleedRight = cfg.bleedRight ?? cfg.bleed ?? 0
  const bleedBottom = cfg.bleedBottom ?? cfg.bleed ?? 0
  const bleedLeft = cfg.bleedLeft ?? cfg.bleed ?? 0
  
  // Gutter guides show binding allowance lines
  // For printing, gutters are additional space for binding
  const gutterPx = toScaledPx(cfg.gutter, cfg.unit, getScaledDimensions(cfg, 600).scale)
  
  switch (side) {
    case 'top':
      return {
        position: 'absolute',
        top: `${(bleedTop / cfg.height) * 100}%`,
        left: 0,
        right: 0,
        height: `${(gutterPx / cfg.height) * 100}%`,
      }
    case 'bottom':
      return {
        position: 'absolute',
        bottom: `${(bleedBottom / cfg.height) * 100}%`,
        left: 0,
        right: 0,
        height: `${(gutterPx / cfg.height) * 100}%`,
      }
    case 'left':
      return {
        position: 'absolute',
        left: `${(bleedLeft / cfg.width) * 100}%`,
        top: 0,
        bottom: 0,
        width: `${(gutterPx / cfg.width) * 100}%`,
      }
    case 'right':
      return {
        position: 'absolute',
        right: `${(bleedRight / cfg.width) * 100}%`,
        top: 0,
        bottom: 0,
        width: `${(gutterPx / cfg.width) * 100}%`,
      }
  }
  
  return {}
}

const getSlotStyle = (slot, page) => {
  const cfg = zineStore.zineConfig
  
  // Use page-specific margin override if set, otherwise use global margin
  const effectiveMargin = page?.marginOverride !== null && page?.marginOverride !== undefined 
    ? page.marginOverride 
    : cfg?.margin
  
  if (!cfg || !effectiveMargin) {
    // No margin configured, use simple percentage positioning
    return {
      position: 'absolute',
      left: `${slot.x}%`,
      top: `${slot.y}%`,
      width: `${slot.width}%`,
      height: `${slot.height}%`,
      zIndex: slot.zIndex !== undefined ? slot.zIndex : 0,
    }
  }
  
  // Get scaled dimensions to calculate margin in pixels
  const { scale } = getScaledDimensions(cfg, 600)
  const marginPx = toScaledPx(effectiveMargin, cfg.unit, scale)
  
  // Apply margin to each slot individually
  // Each slot gets margin on all sides, creating gaps between adjacent slots
  return {
    position: 'absolute',
    left: `calc(${slot.x}% + ${marginPx}px)`,
    top: `calc(${slot.y}% + ${marginPx}px)`,
    width: `calc(${slot.width}% - ${marginPx * 2}px)`,
    height: `calc(${slot.height}% - ${marginPx * 2}px)`,
    zIndex: slot.zIndex !== undefined ? slot.zIndex : 0,
  }
}

const getSlotInnerStyle = (slot) => {
  const marginPx = Math.max(0, Math.min(200, Number(slot.innerMarginPx) || 0))
  
  const style = {
    width: '100%',
    height: '100%',
    padding: `${marginPx}px`,
    boxSizing: 'border-box',
  }
  
  // Add background color if set (shows in padding area when image is present)
  if (slot.backgroundColor) {
    style.backgroundColor = slot.backgroundColor
  }
  
  return style
}

const getAssetUrl = (assetId) => {
  const asset = zineStore.mediaAssets.find(a => a.id === assetId)
  return asset?.url || ''
}

const getImageStyle = (slot) => {
  // For cover mode with custom positioning, use object-position
  if (slot.fit === 'cover' && (slot.imageOffsetX !== undefined || slot.imageOffsetY !== undefined)) {
    const offsetX = Math.max(0, Math.min(100, slot.imageOffsetX !== undefined ? slot.imageOffsetX : 50))
    const offsetY = Math.max(0, Math.min(100, slot.imageOffsetY !== undefined ? slot.imageOffsetY : 50))
    
    return {
      objectPosition: `${offsetX}% ${offsetY}%`
    }
  }
  
  // Default: center
  return {
    objectPosition: '50% 50%'
  }
}

const handleImageLoad = (event, slot) => {
  const img = event.target
  const wrapper = img.parentElement
  if (!wrapper) return
  
  const wrapperWidth = wrapper.offsetWidth
  const wrapperHeight = wrapper.offsetHeight
  const imgAspect = img.naturalWidth / img.naturalHeight
  const wrapperAspect = wrapperWidth / wrapperHeight
  
  if (slot.fit === 'cover') {
    // Use object-fit: cover with object-position for proper positioning
    img.style.objectFit = 'cover'
    img.style.width = '100%'
    img.style.height = '100%'
    // object-position is set reactively by getImageStyle()
  } else {
    // For contain: fit entire image within container
    img.style.objectFit = 'contain'
    if (imgAspect > wrapperAspect) {
      // Image is wider - fit width, let height be smaller
      img.style.width = '100%'
      img.style.height = 'auto'
    } else {
      // Image is taller - fit height, let width be smaller
      img.style.width = 'auto'
      img.style.height = '100%'
    }
    // No object-position for contain mode
  }
}

const addPageWithLayout = (layout) => {
  zineStore.addPage({
    type: layout.id,
    slots: layout.slots,
    textElements: layout.textElements,
  })
}

// Image repositioning for cover mode
const imageDragState = ref(null)

const startImageDrag = (event, pageId, slotIndex, slot) => {
  event.preventDefault()
  event.stopPropagation()
  
  console.log('🖱️ Starting image drag', { pageId, slotIndex, fit: slot.fit })
  
  const img = event.target
  const wrapper = img.parentElement
  if (!wrapper) {
    console.warn('No wrapper found for image')
    return
  }
  
  // Calculate the draggable range based on image overflow
  const wrapperRect = wrapper.getBoundingClientRect()
  const imgRect = img.getBoundingClientRect()
  
  console.log('Drag bounds:', {
    wrapper: { w: wrapperRect.width, h: wrapperRect.height },
    img: { w: imgRect.width, h: imgRect.height },
    overflow: {
      x: imgRect.width - wrapperRect.width,
      y: imgRect.height - wrapperRect.height
    }
  })
  
  imageDragState.value = {
    pageId,
    slotIndex,
    startX: event.clientX,
    startY: event.clientY,
    initialOffsetX: slot.imageOffsetX || 50,
    initialOffsetY: slot.imageOffsetY || 50,
    wrapperWidth: wrapperRect.width,
    wrapperHeight: wrapperRect.height,
    imgWidth: imgRect.width,
    imgHeight: imgRect.height,
  }
  
  // Add global listeners
  document.addEventListener('mousemove', handleImageDrag)
  document.addEventListener('mouseup', stopImageDrag)
  
  // Change cursor
  document.body.style.cursor = 'grabbing'
}

const handleImageDrag = (event) => {
  if (!imageDragState.value) return
  
  const state = imageDragState.value
  const deltaX = event.clientX - state.startX
  const deltaY = event.clientY - state.startY
  
  // For object-fit: cover, object-position percentages work perfectly
  // We can allow the full 0-100% range since it will always show part of the image
  // and never create empty space
  
  // Simple calculation: map drag distance to percentage
  // For natural feel: dragging in a direction shows more of that side of the image
  const dragSensitivity = 2 // pixels per percent
  const percentX = Math.max(0, Math.min(100, state.initialOffsetX + deltaX / dragSensitivity))
  const percentY = Math.max(0, Math.min(100, state.initialOffsetY - deltaY / dragSensitivity))
  
  // Update store
  zineStore.setSlotImagePosition(state.pageId, state.slotIndex, percentX, percentY)
}

const stopImageDrag = () => {
  if (!imageDragState.value) return
  
  document.removeEventListener('mousemove', handleImageDrag)
  document.removeEventListener('mouseup', stopImageDrag)
  document.body.style.cursor = ''
  
  imageDragState.value = null
}

// Zoom controls - DISABLED for now
// const zoomIn = () => {
//   if (zoom.value < 200) {
//     zoom.value = Math.min(zoom.value + 25, 200)
//   }
// }
// 
// const zoomOut = () => {
//   if (zoom.value > 25) {
//     zoom.value = Math.max(zoom.value - 25, 25)
//   }
// }
// 
// const resetZoom = () => {
//   zoom.value = 100
// }
// 
// const fitToScreen = () => {
//   // Calculate ideal zoom to fit page in viewport
//   // For now, just set to 75% as a reasonable fit
//   zoom.value = 75
// }

const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const handleDrop = (event, pageId, slotIndex) => {
  event.preventDefault()
  const assetId = event.dataTransfer.getData('assetId')
  if (assetId) {
    zineStore.setAssetToSlot(pageId, slotIndex, assetId)
  }
}

const handlePageDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const handlePageDrop = (event, pageId) => {
  event.preventDefault()
  
  // Capture event data immediately before any async operations
  const elementSpecData = event.dataTransfer.getData('elementSpec')
  const pageElement = event.currentTarget
  const clientX = event.clientX
  const clientY = event.clientY
  
  if (elementSpecData) {
    try {
      const { specId, type } = JSON.parse(elementSpecData)
      
      // Get drop position relative to page
      const rect = pageElement.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100
      
      // Create element from spec
      const element = createElementFromSpec(specId, {
        x: Math.max(0, Math.min(80, x - 10)),
        y: Math.max(0, Math.min(80, y - 10))
      })
      
      if (element && type === 'text') {
        zineStore.addTextElement(pageId, element)
      }
      // Future: handle other element types (shapes, qr codes, etc.)
    } catch (e) {
      console.error('Failed to parse element spec:', e)
    }
  }
}

const toggleFit = (pageId, slotIndex) => {
  zineStore.toggleSlotFit(pageId, slotIndex)
  
  // Recalculate image dimensions after fit mode changes
  nextTick(() => {
    const img = document.querySelector(`img[data-slot-id="${pageId}-${slotIndex}"]`)
    if (img && img.complete) {
      const page = zineStore.getPageById(pageId)
      const slot = page?.slots[slotIndex]
      if (slot) {
        handleImageLoad({ target: img }, slot)
      }
    }
  })
}

const setSlotInnerMargin = (pageId, slotIndex, value) => {
  zineStore.setSlotInnerMargin(pageId, slotIndex, value)
}

const setSlotBackgroundColor = (pageId, slotIndex, color) => {
  zineStore.setSlotBackgroundColor(pageId, slotIndex, color)
}

const pageWidthPx = computed(() => {
  const config = zineStore.zineConfig
  if (!config) return 800
  const { widthPx } = getScaledDimensions(config, Infinity) // No scaling, just conversion
  return widthPx
})

const pageHeightPx = computed(() => {
  const config = zineStore.zineConfig
  if (!config) return 600
  const { heightPx } = getScaledDimensions(config, Infinity) // No scaling, just conversion
  return heightPx
})

const addText = (pageId) => {
  zineStore.addTextElement(pageId)
}

const updateTextElement = (pageId, elementId, updates) => {
  zineStore.updateTextElement(pageId, elementId, updates)
}

const editTextElement = (pageId, elementId) => {
  const page = zineStore.getPageById(pageId)
  const element = page?.textElements?.find(el => el.id === elementId)
  if (element) {
    currentTextStyle.value = { ...element.style }
    currentEditingElement.value = { pageId, elementId }
    
    // Position toolbar at top center of viewport
    textToolbarPosition.value = {
      top: 80,
      left: window.innerWidth / 2 - 400, // Center the 800px wide toolbar
    }
    textToolbarVisible.value = true
  }
}

const deleteTextElement = (pageId, elementId) => {
  if (confirm('Delete this text element?')) {
    zineStore.deleteTextElement(pageId, elementId)
  }
}

const handleTextEditingChange = (isEditing) => {
  isTextBeingEdited.value = isEditing
}

const closeTextToolbar = (event) => {
  // Only close if clicking outside both text area and toolbar
  if (event && event.target.closest('.text-toolbar')) {
    return
  }
  textToolbarVisible.value = false
  currentEditingElement.value = { pageId: null, elementId: null }
}

// Close toolbar when clicking outside
const handleClickOutside = (event) => {
  if (textToolbarVisible.value && 
      !event.target.closest('.floating-text-box') && 
      !event.target.closest('.text-toolbar')) {
    closeTextToolbar()
  }
}

// Keyboard shortcuts for zoom - DISABLED for now
// const handleZoomKeyboard = (e) => {
//   const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
//   const cmdKey = isMac ? e.metaKey : e.ctrlKey
//   
//   // Cmd/Ctrl + Plus = Zoom in
//   if (cmdKey && (e.key === '+' || e.key === '=')) {
//     e.preventDefault()
//     zoomIn()
//     return
//   }
//   
//   // Cmd/Ctrl + Minus = Zoom out
//   if (cmdKey && (e.key === '-' || e.key === '_')) {
//     e.preventDefault()
//     zoomOut()
//     return
//   }
//   
//   // Cmd/Ctrl + 0 = Reset zoom
//   if (cmdKey && e.key === '0') {
//     e.preventDefault()
//     resetZoom()
//     return
//   }
// }

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // window.addEventListener('keydown', handleZoomKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // window.removeEventListener('keydown', handleZoomKeyboard)
})

// Debounce timer for style updates
let styleUpdateTimeout = null

const updateTextStyle = (styleUpdates) => {
  const { pageId, elementId } = currentEditingElement.value
  if (pageId && elementId) {
    // Update local style immediately for responsive UI
    currentTextStyle.value = {
      ...currentTextStyle.value,
      ...styleUpdates
    }
  
// Debounce the actual store update to avoid excessive re-renders
if (styleUpdateTimeout) {
clearTimeout(styleUpdateTimeout)
}
  
styleUpdateTimeout = setTimeout(() => {
zineStore.updateTextElementStyle(pageId, elementId, styleUpdates)
}, 100) // 100ms debounce for style updates
}
}

const applyTextPreset = (preset) => {
  const presets = {
    'editorial-hero': { fontSize: 72, fontWeight: 900, textAlign: 'left', padding: 30, lineHeight: 0.9, color: '#000000' },
    'bold-number': { fontSize: 120, fontWeight: 900, textAlign: 'center', padding: 20, lineHeight: 0.8, color: '#000000' },
    'magazine-title': { fontSize: 64, fontWeight: 900, textAlign: 'left', padding: 25, lineHeight: 0.95, color: '#000000' },
    'impact-statement': { fontSize: 56, fontWeight: 700, textAlign: 'center', padding: 50, lineHeight: 1.1, color: '#000000' },
    'heading': { fontSize: 32, fontWeight: 700, textAlign: 'left', padding: 20, lineHeight: 1.3 },
    'body': { fontSize: 16, fontWeight: 400, textAlign: 'left', padding: 20, lineHeight: 1.6 },
    'minimal-caption': { fontSize: 12, fontWeight: 400, textAlign: 'left', padding: 15, lineHeight: 1.8, color: '#666666' },
  }
  
  if (presets[preset]) {
    updateTextStyle(presets[preset])
  }
}

const bringTextToFront = () => {
  if (selectedTextElement.value && currentPage.value) {
    zineStore.bringTextElementToFront(currentPage.value.id, selectedTextElement.value.id)
  }
}

const sendTextToBack = () => {
  if (selectedTextElement.value && currentPage.value) {
    zineStore.sendTextElementToBack(currentPage.value.id, selectedTextElement.value.id)
  }
}

const bringSlotToFront = (pageId, slotIndex) => {
  zineStore.bringSlotToFront(pageId, slotIndex)
}

const sendSlotToBack = (pageId, slotIndex) => {
  zineStore.sendSlotToBack(pageId, slotIndex)
}

// Context Menu Functions
const selectSlot = (pageId, index) => {
  const page = zineStore.getPageById(pageId)
  if (!page || !page.slots[index]) return
  
  // Calculate position: 40px to the right of the page
  const pageEl = document.querySelector(`[data-page-id="${pageId}"]`)
  if (pageEl) {
    const rect = pageEl.getBoundingClientRect()
    contextMenuPosition.value = {
      left: `${rect.right + 40}px`,
      top: `${rect.top}px`
    }
  }
  
  // If context menu is already open for a different element, close and reopen with transition
  const isDifferentElement = contextMenuVisible.value && 
    (selectedElementType.value !== 'slot' || 
     selectedElementRef.value?.pageId !== pageId || 
     selectedElementRef.value?.index !== index)
  
  if (isDifferentElement) {
    contextMenuVisible.value = false
    if (contextMenuTransitionTimeout) clearTimeout(contextMenuTransitionTimeout)
    contextMenuTransitionTimeout = setTimeout(() => {
      selectedElement.value = page.slots[index]
      selectedElementType.value = 'slot'
      selectedElementRef.value = { pageId, index }
      selectedSlot.value = { pageId, index }
      contextMenuVisible.value = true
    }, 150) // Brief delay for visual feedback
  } else {
    selectedElement.value = page.slots[index]
    selectedElementType.value = 'slot'
    selectedElementRef.value = { pageId, index }
    selectedSlot.value = { pageId, index }
    contextMenuVisible.value = true
  }
}

const selectTextElement = (pageId, elementId) => {
  const page = zineStore.getPageById(pageId)
  if (!page || !page.textElements) return
  
  const element = page.textElements.find(el => el.id === elementId)
  if (!element) return
  
  // Calculate position: 40px to the right of the page
  const pageEl = document.querySelector(`[data-page-id="${pageId}"]`)
  if (pageEl) {
    const rect = pageEl.getBoundingClientRect()
    contextMenuPosition.value = {
      left: `${rect.right + 40}px`,
      top: `${rect.top}px`
    }
  }
  
  // If context menu is already open for a different element, close and reopen with transition
  const isDifferentElement = contextMenuVisible.value && 
    (selectedElementType.value !== 'text' || 
     selectedElementRef.value?.pageId !== pageId || 
     selectedElementRef.value?.elementId !== elementId)
  
  if (isDifferentElement) {
    contextMenuVisible.value = false
    if (contextMenuTransitionTimeout) clearTimeout(contextMenuTransitionTimeout)
    contextMenuTransitionTimeout = setTimeout(() => {
      selectedElement.value = element
      selectedElementType.value = 'text'
      selectedElementRef.value = { pageId, elementId }
      contextMenuVisible.value = true
    }, 150) // Brief delay for visual feedback
  } else {
    selectedElement.value = element
    selectedElementType.value = 'text'
    selectedElementRef.value = { pageId, elementId }
    contextMenuVisible.value = true
  }
}

const openPageContextMenu = (page) => {
  // Select page and open context menu for page settings
  const pageElement = {
    id: page.id,
    type: page.type,
    // Add any other page properties you want to show
  }
  
  // Calculate position: 40px to the right of the page
  const pageEl = document.querySelector(`[data-page-id="${page.id}"]`)
  if (pageEl) {
    const rect = pageEl.getBoundingClientRect()
    contextMenuPosition.value = {
      left: `${rect.right + 40}px`,
      top: `${rect.top}px`
    }
  }
  
  // If context menu is already open for a different element, close and reopen with transition
  const isDifferentElement = contextMenuVisible.value && 
    (selectedElementType.value !== 'page' || 
     selectedElementRef.value?.pageId !== page.id)
  
  if (isDifferentElement) {
    contextMenuVisible.value = false
    if (contextMenuTransitionTimeout) clearTimeout(contextMenuTransitionTimeout)
    contextMenuTransitionTimeout = setTimeout(() => {
      selectedElement.value = pageElement
      selectedElementType.value = 'page'
      selectedElementRef.value = { pageId: page.id }
      contextMenuVisible.value = true
    }, 150) // Brief delay for visual feedback
  } else {
    selectedElement.value = pageElement
    selectedElementType.value = 'page'
    selectedElementRef.value = { pageId: page.id }
    contextMenuVisible.value = true
  }
}

const closeContextMenu = () => {
  if (contextMenuTransitionTimeout) {
    clearTimeout(contextMenuTransitionTimeout)
    contextMenuTransitionTimeout = null
  }
  contextMenuVisible.value = false
  selectedElement.value = null
  selectedElementType.value = null
  selectedElementRef.value = null
  selectedSlot.value = null
}

const handleContextBringToFront = () => {
  if (!selectedElementRef.value) return
  
  if (selectedElementType.value === 'slot') {
    zineStore.bringSlotToFront(selectedElementRef.value.pageId, selectedElementRef.value.index)
  } else if (selectedElementType.value === 'text') {
    zineStore.bringTextElementToFront(selectedElementRef.value.pageId, selectedElementRef.value.elementId)
  }
}

const handleContextSendToBack = () => {
  if (!selectedElementRef.value) return
  
  if (selectedElementType.value === 'slot') {
    zineStore.sendSlotToBack(selectedElementRef.value.pageId, selectedElementRef.value.index)
  } else if (selectedElementType.value === 'text') {
    zineStore.sendTextElementToBack(selectedElementRef.value.pageId, selectedElementRef.value.elementId)
  }
}

const handleContextToggleFit = () => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value) {
    toggleFit(selectedElementRef.value.pageId, selectedElementRef.value.index)
  }
}

const handleContextSetBackgroundColor = (color) => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value) {
    setSlotBackgroundColor(selectedElementRef.value.pageId, selectedElementRef.value.index, color)
  }
}

const handleContextSetInnerMargin = (value) => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value) {
    setSlotInnerMargin(selectedElementRef.value.pageId, selectedElementRef.value.index, value)
  }
}

const handleNudgeImage = ({ deltaX, deltaY }) => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value) {
    const slot = selectedElement.value
    const currentX = slot.imageOffsetX || 50
    const currentY = slot.imageOffsetY || 50
    
    // Clamp to 0-100% range
    const newX = Math.max(0, Math.min(100, currentX + deltaX))
    const newY = Math.max(0, Math.min(100, currentY + deltaY))
    
    zineStore.setSlotImagePosition(
      selectedElementRef.value.pageId,
      selectedElementRef.value.index,
      newX,
      newY
    )
  }
}

const handleResetImagePosition = () => {
  if (selectedElementType.value === 'slot' && selectedElementRef.value) {
    zineStore.setSlotImagePosition(
      selectedElementRef.value.pageId,
      selectedElementRef.value.index,
      50,
      50
    )
  }
}

const handleContextUpdateStyle = (styleUpdates) => {
  if (selectedElementType.value === 'text' && selectedElementRef.value) {
    zineStore.updateTextElementStyle(
      selectedElementRef.value.pageId,
      selectedElementRef.value.elementId,
      styleUpdates
    )
  }
}

const handleContextToggleLock = () => {
  if (selectedElementType.value === 'text' && selectedElementRef.value) {
    const page = zineStore.getPageById(selectedElementRef.value.pageId)
    if (!page || !page.textElements) return
    
    const element = page.textElements.find(el => el.id === selectedElementRef.value.elementId)
    if (element) {
      element.locked = !element.locked
      // Update selectedElement to reflect the change
      selectedElement.value = { ...element }
    }
  }
}

const handleContextDelete = () => {
  if (!selectedElementRef.value) return
  
  if (selectedElementType.value === 'slot') {
    // For slots, just clear the image
    const page = zineStore.getPageById(selectedElementRef.value.pageId)
    if (page && page.slots[selectedElementRef.value.index]) {
      page.slots[selectedElementRef.value.index].assetId = null
    }
  } else if (selectedElementType.value === 'text') {
    deleteTextElement(selectedElementRef.value.pageId, selectedElementRef.value.elementId)
  }
  
  closeContextMenu()
}

const handleTogglePageMarginOverride = () => {
  if (!selectedElementRef.value?.pageId) return
  const page = zineStore.getPageById(selectedElementRef.value.pageId)
  if (!page) return
  
  if (page.marginOverride === null) {
    // Enable override with current global margin
    zineStore.setPageMarginOverride(page.id, zineStore.zineConfig.margin)
  } else {
    // Disable override
    zineStore.setPageMarginOverride(page.id, null)
  }
  
  // Update selected element to reflect changes
  selectedElement.value = {
    ...page,
    unit: zineStore.zineConfig.unit
  }
}

const handleSetPageMargin = (margin) => {
  if (!selectedElementRef.value?.pageId) return
  const page = zineStore.getPageById(selectedElementRef.value.pageId)
  if (!page) return
  
  if (!isNaN(margin) && margin >= 0) {
    zineStore.setPageMarginOverride(page.id, margin)
    
    // Update selected element to reflect changes
    selectedElement.value = {
      ...page,
      unit: zineStore.zineConfig.unit
    }
  }
}
</script>

<style scoped>
.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
  transition: background var(--transition);
  position: relative;
}

/* Zoom Controls - DISABLED for now */
/* .zoom-controls { ... } */

.toolbar {
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border);
  padding: 0;
  overflow: visible;
  flex-shrink: 0;
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  box-shadow: var(--shadow-sm), inset 0 -1px 0 rgba(255,255,255,0.1);
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
}

.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
}

.toolbar-mode-tabs {
  display: flex;
  gap: 8px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s;
  border-radius: 8px 8px 0 0;
}

.mode-tab:hover {
  color: var(--text);
  background: var(--muted);
}

.mode-tab.active {
  color: var(--accent);
  background: var(--muted);
  border-bottom-color: var(--accent);
}

.mode-tab .mode-icon {
  font-size: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-guides {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--text);
}

.toggle-guides input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent);
}

.toolbar-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.collapse-btn {
  padding: 6px 12px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text);
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: scale(1.05);
}

.toolbar-content {
  display: flex;
  flex-direction: column;
}

.toolbar-mode-content {
  display: flex;
  flex-direction: column;
}

.toolbar-expand-enter-active,
.toolbar-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.toolbar-expand-enter-from,
.toolbar-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.toolbar-expand-enter-to,
.toolbar-expand-leave-from {
  max-height: 300px;
  opacity: 1;
}

.toolbar-tabs {
  display: flex;
  gap: 8px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.category-tab:hover {
  color: var(--text);
  background: var(--muted);
}

.category-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.category-icon {
  font-size: 16px;
}

.category-name {
  font-size: 12px;
}

.toolbar-layouts {
  padding: 16px 24px;
  min-height: 120px;
  overflow-x: auto;
}

.layouts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

.layouts-fade-enter-active,
.layouts-fade-leave-active {
  transition: opacity 0.15s ease;
}

.layouts-fade-enter-from,
.layouts-fade-leave-to {
  opacity: 0;
}
.layout-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--panel-bg-solid);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
}

.layout-btn:hover {
  border-color: var(--accent);
  background: var(--muted);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.layout-preview-mini {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 6px;
  padding: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.layout-preview-mini svg {
  width: 100%;
  height: 100%;
}

.layout-icon {
  font-size: 32px;
}

.layout-name {
  font-size: 12px;
  font-weight: 600;
  transition: color var(--transition);
  text-align: center;
  line-height: 1.2;
  color: var(--text-muted);
}
.canvas-workspace {
  flex: 1;
  overflow-y: auto;
  background: var(--workspace-bg);
  transition: background var(--transition);
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* .canvas-zoom-wrapper - DISABLED for now */
/* .canvas-zoom-wrapper { ... } */

/* Disable hover effects when text is being edited */
.canvas-workspace.editing-text .page-canvas:hover,
.canvas-workspace.editing-text .slot:hover,
.canvas-workspace.editing-text .page-canvas,
.canvas-workspace.editing-text .slot {
  pointer-events: none;
}

/* But keep text elements and toolbar interactive */
.canvas-workspace.editing-text .floating-text-box,
.canvas-workspace.editing-text .text-toolbar {
  pointer-events: auto;
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.empty-message {
  text-align: center;
  color: var(--text-muted);
}

.empty-message h3 {
  font-size: 22px;
  margin-bottom: 12px;
  color: var(--text);
  font-weight: 600;
}

.empty-message p {
  font-size: 15px;
  opacity: 0.8;
}

.pages-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.pages-stack {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}

/* Spread view: 2 pages per row for flat/stapled binding */
.pages-stack.spread-view {
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start; /* Align pages to top */
  gap: calc(24px * var(--scale-factor, 1));
  max-width: calc(2 * 600px * var(--scale-factor, 1) + 24px * var(--scale-factor, 1));
}

.pages-stack.spread-view .page-wrapper {
  flex: 0 0 auto; /* Let page determine its own size */
  align-items: flex-start; /* Override center alignment */
}

/* Remove extra margins in spread view */
.pages-stack.spread-view .page-wrapper:first-child {
  margin-top: 0;
}

.page {
  position: relative;
  background: var(--page-bg);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18), 0 10px 24px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255,255,255,0.15);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
  overflow: visible;
  border: none;
}

.page:hover {
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.22), 0 12px 26px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-1px) scale(1.0005);
}

.page.active {
  box-shadow: 0 22px 52px rgba(15, 23, 42, 0.2), 0 10px 28px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

.slot {
  border: 2px dashed var(--border);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  border-radius: 4px;
  cursor: pointer;
}

.slot.hide-guides {
  border-color: transparent;
}

.slot:hover {
  border-color: var(--accent);
  border-style: solid;
}

.slot.selected {
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

/* Hide slot borders and border radius during export */
.export-mode .slot {
  border: none !important;
  border-radius: 0 !important;
}

/* Remove page border, shadow, and border radius during export */
.export-mode.page {
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.page-inner {
  position: absolute;
  inset: 0;
  /* pointer-events: none; */ /* Removed - was blocking drag and drop */
}

.slot-inner {
  position: relative;
  overflow: hidden;
  display: block;
}

.slot:hover:not(.hide-guides) {
  border-color: var(--accent);
  border-width: 3px;
  box-shadow: inset 0 0 0 1px var(--accent);
}

/* Enhanced drag feedback - highlight all slots when dragging */
body.dragging-image .slot {
  border-color: var(--accent);
  border-width: 2px;
  border-style: dashed;
  background: rgba(99, 102, 241, 0.05);
  transition: all 0.2s ease;
}

body.dragging-image .slot:empty::after {
  content: '📸';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  opacity: 0.3;
  pointer-events: none;
}

body.dragging-image .slot:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent);
  border-width: 3px;
  border-style: solid;
  box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.2), 0 0 0 3px rgba(99, 102, 241, 0.3);
  transform: scale(1.02);
}

.slot-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.slot-image-wrapper.contain {
  /* Contain: image fits within container, may show empty space */
  /* Dimensions set dynamically via JavaScript based on aspect ratio */
  background: transparent;
}

.slot-image-wrapper.contain .slot-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.slot-image-wrapper.cover {
  /* Cover: image fills container, may be cropped */
  /* Image dimensions are set dynamically via JavaScript based on aspect ratio */
  background: transparent;
}

.slot-image-wrapper.cover .slot-image {
  /* No positioning needed - object-fit: cover and object-position handle everything */
  position: static;
  width: 100%;
  height: 100%;
}

.slot-image {
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.slot-image.repositionable {
  cursor: grab;
}

.slot-image.repositionable:active {
  cursor: grabbing;
}

.slot-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
  border-radius: 4px;
  transition: all var(--transition);
}

/* Only show overlay background if no backgroundColor is set */
.slot-placeholder:not(.has-background) {
  background: var(--muted);
}

.slot:hover .slot-placeholder:not(.has-background) {
  background: color-mix(in srgb, var(--accent) 10%, var(--muted));
  color: var(--accent);
}

/* When slot has background color, no overlay */
.slot-placeholder.has-background {
  background: transparent;
}

.text-slot {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.text-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-align: inherit;
  color: inherit;
  padding: inherit;
}

.text-input::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.type-toggle,
.fit-toggle {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--panel-bg);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}

.type-toggle:hover,
.fit-toggle:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: scale(1.05);
}

.slot-controls {
  position: absolute;
  left: 8px;
  bottom: 8px;
  right: 8px;
  display: none;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.inner-margin {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all var(--transition);
}

.inner-margin .range { 
  width: 80px; 
  accent-color: var(--accent);
  cursor: pointer;
}
.inner-margin .value { 
  font-size: 11px; 
  font-weight: 600;
  color: var(--text);
  min-width: 28px;
  text-align: right;
}

.layer-controls-slot {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 100;
}

.slot:hover .layer-controls-slot {
  opacity: 1;
  pointer-events: auto;
}

.layer-btn-minimal {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 300;
  line-height: 1;
  color: #1a1d23;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.layer-btn-minimal:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.layer-btn-minimal:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.color-picker-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all var(--transition);
}

.color-label {
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.color-input {
  width: 32px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

.clear-color {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s;
}

.clear-color:hover {
  background: var(--muted);
  color: var(--text);
}

.slot:hover .slot-controls { 
  display: flex;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.page-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  padding: 0 20px;
  transition: margin-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Ensure children don't affect layout when positioned absolutely */
  isolation: isolate;
}

.page-wrapper:first-child {
  margin-top: 40px;
}

/* Page number chips */
.page-numbers {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
}

.page-number-chip {
  position: absolute;
  background: var(--accent);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 28px;
  text-align: center;
}

.page-number-chip.left {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  right: 50%;
  margin-right: 10px;
}

.page-number-chip.right {
  background: linear-gradient(135deg, var(--accent-strong) 0%, var(--accent) 100%);
  right: 30px;
}

.page-number-chip.single {
  background: var(--accent);
  left: 50%;
  transform: translateX(-50%);
}

/* Hide page numbers when printing */
@media print {
  .no-print,
  .page-numbers {
    display: none !important;
  }
}

.add-text-pill {
  padding: 12px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.add-text-pill:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: var(--accent-strong);
}

/* Hide UI elements during export */
.export-mode .export-hide {
  display: none !important;
}

/* Guides */
.guides { 
  pointer-events: none;
  z-index: 10;
}
.guide {
  position: absolute;
  inset: 0;
  border: 1px dashed transparent;
  transition: border-color var(--transition);
}
.guide-bleed { 
  border-color: rgba(239, 68, 68, 0.8);
  border-width: 1px;
}
.guide-margin { 
  border-color: rgba(34, 197, 94, 0.8);
  border-width: 1px;
}
.guide-fold {
  border: none;
  background: none;
}
.guide-fold::before,
.guide-fold::after {
  content: '';
  position: absolute;
  background: rgba(239, 68, 68, 0.6);
}
.guide-fold::before {
  /* Vertical center line */
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-0.5px);
}
.guide-fold::after {
  /* Horizontal center line */
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  transform: translateY(-0.5px);
}

.guide-gutter-top,
.guide-gutter-bottom {
  border: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(34, 197, 94, 0.3) 0px,
    rgba(34, 197, 94, 0.3) 2px,
    transparent 2px,
    transparent 4px
  );
}

.guide-gutter-left,
.guide-gutter-right {
  border: none;
  background: repeating-linear-gradient(
    to right,
    rgba(34, 197, 94, 0.3) 0px,
    rgba(34, 197, 94, 0.3) 2px,
    transparent 2px,
    transparent 4px
  );
}

/* Page crease effect - simulates a deep fold in the center */
.page-crease {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 6px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 100;
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
    inset 2px 0 3px rgba(255, 255, 255, 0.3),
    0 0 8px rgba(0, 0, 0, 0.1);
}

/* Strong highlight on the left side of the crease */
.page-crease::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  box-shadow: -1px 0 3px rgba(255, 255, 255, 0.3);
}

/* Strong shadow on the right side of the crease */
.page-crease::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.25) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.2);
}

/* Hide crease during export */
.export-mode .page-crease {
  display: none !important;
}

/* Slot outer margin guide - shows the slot boundary with applied margin */
.slot-outer-margin-guide {
  position: absolute;
  inset: 0;
  border: 2px dashed rgba(34, 197, 94, 1);
  pointer-events: none;
  z-index: 5;
  border-radius: 2px;
}

/* Slot inner margin guide - shows padding inside the slot */
.slot-inner-margin-guide {
  position: absolute;
  border: 1px dashed rgba(59, 130, 246, 0.6);
  pointer-events: none;
  z-index: 5;
}

/* Hide slot guides during export */
.export-mode .slot-outer-margin-guide,
.export-mode .slot-inner-margin-guide {
  display: none !important;
}

/* Transitions */
.page-fade-enter-active, .page-fade-leave-active { transition: all .25s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(10px) scale(.98); }
.page-fade-leave-to { opacity: 0; transform: translateY(-10px) scale(.98); }
</style>
