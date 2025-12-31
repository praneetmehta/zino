import { defineStore } from 'pinia'
import { DEFAULT_TEXT_STYLE } from '@/utils/textRendering'

export const useZineStore = defineStore('zine', {
  state: () => ({
    // Zine configuration
    zineConfig: null,
    isInitialized: false,
    projectMeta: {
      id: null,
      title: '',
      updatedAt: null,
    },
    
    // Media pool
    mediaAssets: [],
    
    // Pages
    pages: [],
    copiedPage: null, // For copy/paste functionality
    
    // Current selection
    selectedPageId: null,

    // UI settings
    ui: {
      theme: 'light', // 'light' | 'dark'
      showGuides: true,
    },
  }),
  
  getters: {
    getPageById: (state) => (id) => {
      return state.pages.find(page => page.id === id)
    },
    
    selectedPage: (state) => {
      return state.pages.find(page => page.id === state.selectedPageId)
    },
    
    pageCount: (state) => state.pages.length,
  },
  
  actions: {
    initializeZine(config) {
      const bleedValue = config.bleed || 0
      this.zineConfig = {
        width: config.width,
        height: config.height,
        unit: config.unit,
        bleed: bleedValue,
        bleedTop: config.bleedTop ?? bleedValue,
        bleedRight: config.bleedRight ?? bleedValue,
        bleedBottom: config.bleedBottom ?? bleedValue,
        bleedLeft: config.bleedLeft ?? bleedValue,
        margin: config.margin || 0,
        slotInnerMarginPercent: config.slotInnerMarginPercent ?? 0,
        bindingType: config.bindingType || 'folded',
      }
      this.isInitialized = true
      this.pages = []
      this.mediaAssets = []
    },
    
    addMediaAsset(asset) {
      const id = asset.id || String(Date.now() + Math.random())
      this.mediaAssets.push({
        id,
        name: asset.name,
        url: asset.url,
        type: asset.type,
        thumbnail: asset.thumbnail || asset.url,
        originalUrl: asset.originalUrl || asset.url, // High-res version for PDF export
        imageId: asset.imageId || id, // Backend image identifier
        isUploading: asset.isUploading || false, // Upload status
      })
    },
    
    replaceMediaAsset(oldId, newAsset) {
      const index = this.mediaAssets.findIndex(asset => String(asset.id) === String(oldId))
      if (index !== -1) {
        // Replace the placeholder with the actual asset
        this.mediaAssets[index] = {
          id: newAsset.id,
          name: newAsset.name,
          url: newAsset.url,
          type: newAsset.type,
          thumbnail: newAsset.thumbnail || newAsset.url,
          originalUrl: newAsset.originalUrl || newAsset.url,
          imageId: newAsset.imageId || newAsset.id,
          isUploading: false,
        }
      }
    },
    
    removeMediaAsset(id) {
      const index = this.mediaAssets.findIndex(asset => String(asset.id) === String(id))
      if (index !== -1) {
        this.mediaAssets.splice(index, 1)
      }
    },
    
    updateMediaAssetProgress(id, progress) {
      const asset = this.mediaAssets.find(a => String(a.id) === String(id))
      if (asset) {
        asset.uploadProgress = progress
      }
    },
    
    addPage(layout) {
      const id = String(Date.now() + Math.random())
      console.log('zineStore.addPage - Received slots:', layout.slots)
      const page = {
        id,
        layout: layout.type,
        marginOverride: null, // Per-page margin override (null = use global)
        slots: layout.slots.map((slot, index) => {
          const mappedSlot = {
            ...slot,
            type: 'image', // All slots are now image-only
            zIndex: slot.zIndex !== undefined ? slot.zIndex : index,
            assetId: null,
            fit: 'cover',
            innerMarginPx: 0, // Absolute pixel margin
            backgroundColor: slot.backgroundColor || null, // Optional solid color
          }
          console.log(`Slot ${index}:`, mappedSlot)
          return mappedSlot
        }),
        textElements: layout.textElements ? layout.textElements.map(textEl => ({
          ...textEl,
          id: `${id}-${textEl.id}-${Date.now()}`, // Make ID unique per page
        })) : [], // Floating text boxes from layout or empty
      }
      console.log('Created page with slots:', page.slots)
      this.pages.push(page)
      this.selectedPageId = id
    },

    setPageMarginOverride(pageId, margin) {
      const page = this.getPageById(pageId)
      if (page) {
        page.marginOverride = margin
      }
    },
    
    duplicatePage(pageId) {
      const page = this.getPageById(pageId)
      if (!page) return null
      
      const newId = String(Date.now() + Math.random())
      const duplicatedPage = {
        ...page,
        id: newId,
        slots: page.slots.map(slot => ({ ...slot })),
        textElements: page.textElements.map(textEl => ({
          ...textEl,
          id: `${newId}-${textEl.id}-${Date.now()}`
        }))
      }
      
      // Insert after the original page
      const index = this.pages.findIndex(p => p.id === pageId)
      this.pages.splice(index + 1, 0, duplicatedPage)
      this.selectedPageId = newId
      return newId
    },
    
    copyPage(pageId) {
      const page = this.getPageById(pageId)
      if (!page) return
      
      // Store in clipboard (we'll use a simple module-level variable)
      this.copiedPage = JSON.parse(JSON.stringify(page))
    },
    
    pastePage() {
      if (!this.copiedPage) return null
      
      const newId = String(Date.now() + Math.random())
      const pastedPage = {
        ...this.copiedPage,
        id: newId,
        slots: this.copiedPage.slots.map(slot => ({ ...slot })),
        textElements: this.copiedPage.textElements.map(textEl => ({
          ...textEl,
          id: `${newId}-${textEl.id}-${Date.now()}`
        }))
      }
      
      this.pages.push(pastedPage)
      this.selectedPageId = newId
      return newId
    },
    
    removePage(id) {
      const index = this.pages.findIndex(page => page.id === id)
      if (index !== -1) {
        this.pages.splice(index, 1)
        if (this.selectedPageId === id) {
          this.selectedPageId = this.pages[0]?.id || null
        }
      }
    },
    
    reorderPages(fromIndex, toIndex) {
      const page = this.pages.splice(fromIndex, 1)[0]
      this.pages.splice(toIndex, 0, page)
    },
    
    setAssetToSlot(pageId, slotIndex, assetId) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].assetId = assetId
      }
    },

    setSlotFit(pageId, slotIndex, fit) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].fit = fit === 'contain' ? 'contain' : 'cover'
      }
    },

    toggleSlotFit(pageId, slotIndex) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].fit = page.slots[slotIndex].fit === 'cover' ? 'contain' : 'cover'
      }
    },

    setSlotInnerMargin(pageId, slotIndex, pixels) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        const px = Math.max(0, Math.min(200, Number(pixels) || 0))
        page.slots[slotIndex].innerMarginPx = px
      }
    },

    setSlotBackgroundColor(pageId, slotIndex, color) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].backgroundColor = color
      }
    },

    setSlotType(pageId, slotIndex, type) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].type = type
        if (type === 'text') {
          page.slots[slotIndex].assetId = null
        }
      }
    },

    updateSlotText(pageId, slotIndex, content) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].textContent = content
      }
    },

    updateSlotTextStyle(pageId, slotIndex, styleUpdates) {
      const page = this.getPageById(pageId)
      if (page && page.slots[slotIndex]) {
        page.slots[slotIndex].textStyle = {
          ...page.slots[slotIndex].textStyle,
          ...styleUpdates,
        }
      }
    },

    addTextElement(pageId, elementData = {}) {
      const page = this.getPageById(pageId)
      if (!page) return

      const id = Date.now() + Math.random()
      
      // Extract style separately to avoid override issues
      const { style: elementStyle, ...elementProps } = elementData
      
      // Merge with defaults, but prioritize elementData
      const textElement = {
        id,
        x: 20,
        y: 20,
        width: 40,
        height: 20,
        zIndex: (page.textElements?.length || 0) + 100,
        locked: false,
        content: 'Double-click to edit',
        ...elementProps, // Override with elementData
        style: { ...DEFAULT_TEXT_STYLE, ...(elementStyle || {}) }, // Merge styles properly
      }
      
      if (!page.textElements) {
        page.textElements = []
      }
      page.textElements.push(textElement)
      return id
    },

    updateTextElement(pageId, elementId, updates) {
      const page = this.getPageById(pageId)
      if (!page || !page.textElements) return
      
      const element = page.textElements.find(el => el.id === elementId)
      if (element) {
        Object.assign(element, updates)
      }
    },

    updateTextElementStyle(pageId, elementId, styleUpdates) {
      const page = this.getPageById(pageId)
      if (!page || !page.textElements) return
      
      const element = page.textElements.find(el => el.id === elementId)
      if (element) {
        element.style = { ...element.style, ...styleUpdates }
      }
    },

    deleteTextElement(pageId, elementId) {
      const page = this.getPageById(pageId)
      if (!page || !page.textElements) return
      
      const index = page.textElements.findIndex(el => el.id === elementId)
      if (index !== -1) {
        page.textElements.splice(index, 1)
      }
    },

    bringTextElementToFront(pageId, elementId) {
      const page = this.getPageById(pageId)
      if (!page || !page.textElements) return
      
      const element = page.textElements.find(el => el.id === elementId)
      if (!element) return
      
      // Find max z-index among all elements (slots + text)
      const maxSlotZ = Math.max(...page.slots.map(s => s.zIndex || 0), 0)
      const maxTextZ = Math.max(...page.textElements.map(el => el.zIndex || 0), 0)
      const maxZ = Math.max(maxSlotZ, maxTextZ)
      
      element.zIndex = maxZ + 1
    },

    sendTextElementToBack(pageId, elementId) {
      const page = this.getPageById(pageId)
      if (!page || !page.textElements) return
      
      const element = page.textElements.find(el => el.id === elementId)
      if (!element) return
      
      // Find min z-index among all elements
      const minSlotZ = Math.min(...page.slots.map(s => s.zIndex || 0), 0)
      const minTextZ = Math.min(...page.textElements.map(el => el.zIndex || 0), 0)
      const minZ = Math.min(minSlotZ, minTextZ)
      
      element.zIndex = minZ - 1
    },

    bringSlotToFront(pageId, slotIndex) {
      const page = this.getPageById(pageId)
      if (!page || !page.slots[slotIndex]) return
      
      const maxSlotZ = Math.max(...page.slots.map(s => s.zIndex || 0), 0)
      const maxTextZ = page.textElements ? Math.max(...page.textElements.map(el => el.zIndex || 0), 0) : 0
      const maxZ = Math.max(maxSlotZ, maxTextZ)
      
      page.slots[slotIndex].zIndex = maxZ + 1
    },

    sendSlotToBack(pageId, slotIndex) {
      const page = this.getPageById(pageId)
      if (!page || !page.slots[slotIndex]) return
      
      const minSlotZ = Math.min(...page.slots.map(s => s.zIndex || 0), 0)
      const minTextZ = page.textElements ? Math.min(...page.textElements.map(el => el.zIndex || 0), 0) : 0
      const minZ = Math.min(minSlotZ, minTextZ)
      
      page.slots[slotIndex].zIndex = minZ - 1
    },

    applyTextPreset(pageId, slotIndex, preset) {
      const presets = {
        'fill-box': {
          fontSize: 48,
          fontWeight: 700,
          textAlign: 'center',
          padding: 40,
          lineHeight: 1.2,
        },
        'heading': {
          fontSize: 32,
          fontWeight: 700,
          textAlign: 'left',
          padding: 20,
          lineHeight: 1.3,
        },
        'body': {
          fontSize: 16,
          fontWeight: 400,
          textAlign: 'left',
          padding: 20,
          lineHeight: 1.6,
        },
        'quote': {
          fontSize: 24,
          fontWeight: 500,
          textAlign: 'center',
          padding: 40,
          lineHeight: 1.5,
        },
        'editorial-hero': {
          fontSize: 72,
          fontWeight: 900,
          textAlign: 'left',
          padding: 30,
          lineHeight: 0.9,
          color: '#000000',
        },
        'bold-number': {
          fontSize: 120,
          fontWeight: 900,
          textAlign: 'center',
          padding: 20,
          lineHeight: 0.8,
          color: '#000000',
        },
        'minimal-caption': {
          fontSize: 12,
          fontWeight: 400,
          textAlign: 'left',
          padding: 15,
          lineHeight: 1.8,
          color: '#666666',
        },
        'impact-statement': {
          fontSize: 56,
          fontWeight: 700,
          textAlign: 'center',
          padding: 50,
          lineHeight: 1.1,
          color: '#000000',
        },
        'sidebar-label': {
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'left',
          padding: 20,
          lineHeight: 1.4,
          color: '#000000',
        },
        'magazine-title': {
          fontSize: 64,
          fontWeight: 900,
          textAlign: 'left',
          padding: 25,
          lineHeight: 0.95,
          color: '#000000',
        },
      }
      if (presets[preset]) {
        this.updateSlotTextStyle(pageId, slotIndex, presets[preset])
      }
    },
    
    selectPage(id) {
      this.selectedPageId = id
    },
    
    reset() {
      this.zineConfig = null
      this.isInitialized = false
      this.mediaAssets = []
      this.pages = []
      this.selectedPageId = null
      this.projectMeta = {
        id: null,
        title: '',
        updatedAt: null,
      }
    },

    setTheme(theme) {
      this.ui.theme = theme === 'dark' ? 'dark' : 'light'
      // Apply theme to body for teleported components (like dropdowns)
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', this.ui.theme)
      }
      // Persist to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('zino_theme', this.ui.theme)
      }
    },

    toggleTheme() {
      this.ui.theme = this.ui.theme === 'dark' ? 'light' : 'dark'
      // Apply theme to body for teleported components (like dropdowns)
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', this.ui.theme)
      }
      // Persist to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('zino_theme', this.ui.theme)
      }
    },
    
    loadThemeFromStorage() {
      if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('zino_theme')
        if (savedTheme === 'dark' || savedTheme === 'light') {
          this.ui.theme = savedTheme
          if (typeof document !== 'undefined') {
            document.body.setAttribute('data-theme', savedTheme)
          }
        }
      }
    },

    toggleGuides() {
      this.ui.showGuides = !this.ui.showGuides
    },

    setProjectMeta(meta = {}) {
      this.projectMeta = {
        id: meta.id ?? this.projectMeta.id ?? null,
        title: meta.title ?? this.projectMeta.title ?? '',
        updatedAt: meta.updatedAt ?? this.projectMeta.updatedAt ?? null,
      }
    },

    // Export complete project as JSON string
    exportProjectData() {
      return {
        version: 1,
        zineConfig: this.zineConfig,
        mediaAssets: this.mediaAssets,
        pages: this.pages,
      }
    },

    exportAsJSON(pretty = true) {
      const payload = this.exportProjectData()
      return JSON.stringify(payload, null, pretty ? 2 : 0)
    },

    // Import project from JSON string or object
    importFromJSON(data, options = {}) {
      const payload = typeof data === 'string' ? JSON.parse(data) : data
      if (!payload || !payload.zineConfig || !Array.isArray(payload.pages)) {
        throw new Error('Invalid project JSON')
      }
      // Basic normalization
      this.zineConfig = {
        width: payload.zineConfig.width,
        height: payload.zineConfig.height,
        unit: payload.zineConfig.unit,
        bleed: payload.zineConfig.bleed || 0,
        margin: payload.zineConfig.margin || 0,
        slotInnerMarginPercent: payload.zineConfig.slotInnerMarginPercent ?? 0,
        bindingType: payload.zineConfig.bindingType || 'folded', // 'folded' or 'flat'
      }
      this.mediaAssets = (payload.mediaAssets || []).map(a => ({
        id: String(a.id),
        name: a.name,
        url: a.url,
        type: a.type,
        thumbnail: a.thumbnail || a.url,
      }))
      this.pages = (payload.pages || []).map(p => ({
        id: p.id,
        layout: p.layout,
        slots: (p.slots || []).map((s, index) => ({
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          type: 'image',
          zIndex: s.zIndex !== undefined ? s.zIndex : index,
          assetId: s.assetId != null ? String(s.assetId) : null,
          fit: s.fit === 'contain' ? 'contain' : 'cover',
          innerMarginPx: s.innerMarginPx || s.innerMarginPercent || 0, // Support old format
        })),
        textElements: p.textElements || [],
      }))
      this.isInitialized = true
      this.selectedPageId = this.pages[0]?.id || null
      if (options.meta) {
        this.setProjectMeta(options.meta)
      } else {
        this.setProjectMeta({ id: null, title: options.title || '', updatedAt: null })
      }
    },
  },
})
