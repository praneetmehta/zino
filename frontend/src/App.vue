<template>
  <div class="app" :class="`theme-${zineStore.ui.theme}`" :data-theme="zineStore.ui.theme">
    <PortfolioLanding v-if="view === 'portfolio'" />
    <LandingPage
      v-else-if="view === 'landing'"
      :loading="isLoadingRemote"
      :last-saved-summary="lastSavedSummary"
      @create-new="startNewProject"
      @load-book="handleLoad"
      @open-layout-builder="navigateToLayoutBuilder"
      @open-docs="navigateToDocs"
      @try-demo="startDemoMode"
      @require-login="handleRequireLogin"
    />
    <InitModal v-else-if="view === 'init' && !zineStore.isInitialized" @initialize="handleInitialize" />
    <LayoutLibrary
      v-else-if="view === 'layout-library'"
      @close="view = 'editor'"
      @open-builder="view = 'layout-builder'"
    />
    <LayoutBuilder 
      v-else-if="view === 'layout-builder'"
      @close="view = 'layout-library'"
      @save="handleSaveLayout"
    />
    <template v-else>
      <Header
        :saving="isSaving"
        :publishing="isPublishing"
        :loading="isLoadingRemote"
        :show-back="view !== 'landing'"
        :has-unsaved-changes="hasUnsavedChanges"
        @go-home="goHome"
        @export="handleExport"
        @publish="handlePublish"
        @reset="handleReset"
        @save="handleSave"
        @load="handleLoad"
        @flipbook="showFlipbook = true"
      />
      <div class="workspace">
        <MediaPanel @collapsed-change="mediaPanelCollapsed = $event" />
        <Canvas 
          :media-panel-collapsed="mediaPanelCollapsed" 
          :page-panel-collapsed="pagePanelCollapsed" 
        />
        <PagePanel @collapsed-change="pagePanelCollapsed = $event" />
      </div>
      <div class="bottom-hints">
        <div class="command-hint" @click="openCommandBar">
          <kbd>⌘K</kbd>
          <span>Command Bar</span>
        </div>
        <button class="shortcuts-hint" @click="showKeyboardShortcuts = true" title="Keyboard Shortcuts">
          <span>⌨️</span>
          <kbd>?</kbd>
        </button>
      </div>
    </template>
    <CommandBar
      v-if="view === 'editor'"
      ref="commandBar"
      @export="handleExport"
      @save="handleSave"
      @load="handleLoad"
      @flipbook="showFlipbook = true"
    />
    
    <!-- Order Print View -->
    <OrderPrint 
      v-else-if="view === 'order-print'" 
      :publication="selectedPublication"
      @back="view = 'editor'; selectedPublication = null" 
    />

    <!-- Editor View -->
    <transition name="fade">
      <div v-if="showFlipbook" class="flipbook-modal" @click.self="showFlipbook = false">
        <div class="flipbook-modal-content">
          <button class="close-btn" @click="showFlipbook = false">✕</button>
          <FlipBook @close="showFlipbook = false" />
        </div>
      </div>
    </transition>

    <!-- Library Modal -->
    <LibraryModal
      :is-open="showLibrary"
      @close="showLibrary = false"
      @load-book="handleLoadFromLibrary"
      @create-new="startNewProject"
    />

    <!-- Published PDFs Modal -->
    <PublishedPDFsModal 
      :is-open="showPublications" 
      @close="showPublications = false"
      @order-print="handleOrderFromPublication"
    />

    <!-- Google One Tap (shows automatically when not logged in) -->
    <GoogleOneTap />
    <!-- Notification System -->
    <NotificationToast ref="toastRef" />
    <ConfirmDialog ref="confirmRef" />
    
    <!-- PDF Progress Modal -->
    <PDFProgressModal 
      ref="pdfProgressRef"
      :is-open="showPDFProgress"
      :title="pdfProgressTitle"
      :complete-title="pdfCompleteTitle"
      :on-view-published="pdfType === 'publish' ? () => showPublications = true : null"
      @close="showPDFProgress = false"
    />
    
    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal
      :is-open="showKeyboardShortcuts"
      @close="showKeyboardShortcuts = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useZineStore } from './stores/zineStore'
import { useAuthStore } from './stores/authStore'
import InitModal from './components/InitModal.vue'
import Header from './components/Header.vue'
import MediaPanel from './components/MediaPanel.vue'
import Canvas from './components/Canvas.vue'
import PagePanel from './components/PagePanel.vue'
import CommandBar from './components/CommandBar.vue'
import FlipBook from './components/FlipBook.vue'
import PortfolioLanding from './components/PortfolioLanding.vue'
import LandingPage from './components/LandingPage.vue'
import LibraryModal from './components/LibraryModal.vue'
import LayoutBuilder from './components/LayoutBuilder.vue'
import LayoutLibrary from './components/LayoutLibrary.vue'
import GoogleOneTap from './components/GoogleOneTap.vue'
import PublishedPDFsModal from './components/PublishedPDFsModal.vue'
import NotificationToast from './components/NotificationToast.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import PDFProgressModal from './components/PDFProgressModal.vue'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.vue'
import OrderPrint from './components/OrderPrint.vue'
import { setToastInstance, setConfirmInstance, useNotification } from './composables/useNotification'
import { exportToPDF } from './utils/pdfExport'
import { publishToPDF } from './utils/pdfPublish'
import { listBooks, saveBook, getBook } from './api/books'
import html2canvas from 'html2canvas'

const zineStore = useZineStore()
const authStore = useAuthStore()
const commandBar = ref(null)
const toastRef = ref(null)
const confirmRef = ref(null)
const pdfProgressRef = ref(null)
const showPDFProgress = ref(false)
const pdfProgressTitle = ref('Generating PDF')
const pdfCompleteTitle = ref('PDF Ready!')
const pdfType = ref('export') // 'export' or 'publish'
const showFlipbook = ref(false)
const isSaving = ref(false)
const isPublishing = ref(false)
const isLoadingRemote = ref(false)
// Check URL path to determine initial view
const getInitialView = () => {
  const path = window.location.pathname
  if (path === '/zino' || path === '/zino/') return 'landing'
  return 'portfolio'
}

const view = ref(getInitialView()) // portfolio | landing | init | editor | order-print

// Handle browser navigation
window.addEventListener('popstate', () => {
  view.value = getInitialView()
})
const showLibrary = ref(false)
const showPublications = ref(false)
const selectedPublication = ref(null)
const mediaPanelCollapsed = ref(false)
const pagePanelCollapsed = ref(false)
const hasUnsavedChanges = ref(false)
const showKeyboardShortcuts = ref(false)

// Track unsaved changes
watch(
  () => [zineStore.pages, zineStore.mediaAssets, zineStore.zineConfig],
  () => {
    if (zineStore.isInitialized && view.value === 'editor') {
      hasUnsavedChanges.value = true
    }
  },
  { deep: true }
)

// Warn before leaving with unsaved changes
const handleBeforeUnload = (e) => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return e.returnValue
  }
}

// Keyboard shortcuts handler
const handleKeyboard = (e) => {
  // Ignore if typing in input/textarea or contenteditable
  if (e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA' || 
      e.target.isContentEditable) {
    // Allow Cmd+S to save even when in input
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
    return
  }
  
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const cmdKey = isMac ? e.metaKey : e.ctrlKey
  
  // ? - Show keyboard shortcuts
  if (e.key === '?' && !cmdKey) {
    e.preventDefault()
    showKeyboardShortcuts.value = true
    return
  }
  
  // Esc - Close modals/dialogs
  if (e.key === 'Escape') {
    if (showKeyboardShortcuts.value) {
      showKeyboardShortcuts.value = false
      return
    }
    if (showFlipbook.value) {
      showFlipbook.value = false
      return
    }
  }
  
  // Cmd+F - Flipbook preview (only in editor view)
  if (view.value !== 'landing' && view.value !== 'init' && view.value !== 'layout-library' && view.value !== 'layout-builder') {
    if (cmdKey && e.key === 'f') {
      e.preventDefault()
      if (zineStore.pageCount > 0) {
        showFlipbook.value = true
      }
      return
    }
  }
  
  // Cmd+S - Save
  if (cmdKey && e.key === 's') {
    e.preventDefault()
    handleSave()
    return
  }
  
  // Only process page operations in editor view
  if (view.value !== 'landing' && view.value !== 'init' && view.value !== 'layout-library' && view.value !== 'layout-builder') {
    // Cmd+C - Copy page
    if (cmdKey && e.key === 'c') {
      e.preventDefault() // Always prevent default
      if (zineStore.selectedPageId) {
        if (typeof zineStore.copyPage === 'function') {
          zineStore.copyPage(zineStore.selectedPageId)
          toast.success('Page copied')
        } else {
          console.error('copyPage is not a function', zineStore)
          toast.error('Copy page function not available')
        }
      }
      return
    }
    
    // Cmd+V - Paste page
    if (cmdKey && e.key === 'v') {
      e.preventDefault() // Always prevent default
      if (zineStore.copiedPage) {
        if (typeof zineStore.pastePage === 'function') {
          zineStore.pastePage()
          toast.success('Page pasted')
        } else {
          console.error('pastePage is not a function', zineStore)
          toast.error('Paste page function not available')
        }
      }
      return
    }
    
    // Cmd+D - Duplicate page
    if (cmdKey && e.key === 'd') {
      e.preventDefault() // Always prevent default (browser bookmark)
      if (zineStore.selectedPageId) {
        if (typeof zineStore.duplicatePage === 'function') {
          zineStore.duplicatePage(zineStore.selectedPageId)
          toast.success('Page duplicated')
        } else {
          console.error('duplicatePage is not a function', zineStore)
          toast.error('Duplicate page function not available')
        }
      }
      return
    }
  }
  
  // Delete - Delete selected page (only in editor view)
  if (view.value !== 'landing' && view.value !== 'init' && view.value !== 'layout-library' && view.value !== 'layout-builder') {
    if ((e.key === 'Delete' || e.key === 'Backspace')) {
      if (zineStore.selectedPageId && zineStore.pages.length > 0) {
        e.preventDefault()
        handleDeletePage(zineStore.selectedPageId)
      }
      return
    }
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeyboard)
  
  // Load saved theme from localStorage
  zineStore.loadThemeFromStorage()
  
  // Apply theme to body for teleported components (dropdowns, modals, etc.)
  document.body.setAttribute('data-theme', zineStore.ui.theme)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleKeyboard)
})

const formatRelativeTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

const handleInitialize = async (config) => {
  // Initialize zine with config
  zineStore.initializeZine(config)
  
  // Generate book ID and save immediately
  const bookId = `book-${Date.now()}`
  const title = config.title || 'Untitled Zine'
  
  const payload = {
    id: bookId,
    title,
    data: zineStore.exportProjectData(),
    metadata: {
      pageCount: 0, // Empty book
      mediaCount: 0,
    },
  }
  
  try {
    isSaving.value = true
    const saved = await saveBook(payload)
    
    // Set project meta with saved ID
    zineStore.setProjectMeta({ 
      id: saved.id, 
      title: saved.title, 
      updatedAt: saved.updatedAt 
    })
    
    hasUnsavedChanges.value = false
    view.value = 'editor'
    
    console.log(`✅ Created and saved: "${saved.title}" (${saved.id})`)
  } catch (error) {
    console.error('Failed to save new zine:', error)
    // Still proceed to editor, but without saved ID
    zineStore.setProjectMeta({ id: bookId, title, updatedAt: null })
    view.value = 'editor'
    toast.warning('Book created, but auto-save failed. Please save manually.', 'Warning')
  } finally {
    isSaving.value = false
  }
}

const handleExport = async () => {
  if (!zineStore.isInitialized || zineStore.pageCount === 0) {
    toast.warning('No pages to export')
    return
  }
  
  pdfType.value = 'export'
  pdfProgressTitle.value = 'Exporting PDF'
  pdfCompleteTitle.value = 'PDF Downloaded!'
  showPDFProgress.value = true
  
  // Set up steps
  if (pdfProgressRef.value) {
    pdfProgressRef.value.setSteps([
      { label: 'Rendering pages', detail: '' },
      { label: 'Generating PDF', detail: '' },
      { label: 'Saving file', detail: '' }
    ])
  }
  
  try {
    await exportToPDF(zineStore, (stepIndex, progress, detail) => {
      if (pdfProgressRef.value) {
        pdfProgressRef.value.updateProgress(stepIndex, progress)
      }
    })
    
    // Complete progress modal immediately
    if (pdfProgressRef.value) {
      const pdfSize = zineStore.pageCount * 500000 // Rough estimate
      pdfProgressRef.value.complete(pdfSize, zineStore.pageCount)
    }
  } catch (error) {
    showPDFProgress.value = false
    toast.error(error.message, 'Export Failed')
  }
}

const { toast, confirm } = useNotification()

const handleOrderFromPublication = (publication) => {
  selectedPublication.value = publication
  showPublications.value = false
  view.value = 'order-print'
}

const handlePublish = async () => {
  if (!zineStore.isInitialized || zineStore.pageCount === 0) {
    toast.warning('No pages to publish')
    return
  }
  
  // Check if user is authenticated (skip check in dev mode with VITE_SKIP_AUTH)
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true'
  if (!skipAuth && !authStore.isAuthenticated) {
    toast.warning('Please sign in to publish your zine')
    return
  }
  
  pdfType.value = 'publish'
  pdfProgressTitle.value = 'Publishing PDF'
  pdfCompleteTitle.value = '🎉 Published Successfully!'
  showPDFProgress.value = true
  
  // Set up steps
  if (pdfProgressRef.value) {
    pdfProgressRef.value.setSteps([
      { label: 'Rendering pages', detail: '' },
      { label: 'Uploading to server', detail: '' },
      { label: 'Publishing', detail: '' }
    ])
  }
  
  try {
    isPublishing.value = true
    
    // Use temp token in dev mode if not authenticated
    const token = authStore.token || (skipAuth ? 'dev-token' : null)
    if (!token) {
      throw new Error('No authentication token available')
    }
    
    // Publish PDF to server
    const publication = await publishToPDF(zineStore, token, (stepIndex, progress, detail) => {
      if (pdfProgressRef.value) {
        pdfProgressRef.value.updateProgress(stepIndex, progress)
      }
    })
    
    console.log('✅ Published successfully:', publication)
    
    // Complete progress modal immediately
    if (pdfProgressRef.value) {
      pdfProgressRef.value.complete(publication.size || 0, publication.pageCount || zineStore.pageCount)
    }
  } catch (error) {
    console.error('Failed to publish:', error)
    showPDFProgress.value = false
    toast.error(error.message, 'Publish Failed')
  } finally {
    isPublishing.value = false
  }
}

const handleReset = async () => {
  const confirmed = await confirm(
    'All progress will be lost. This action cannot be undone.',
    {
      title: 'Reset Project?',
      type: 'danger',
      confirmText: 'Reset',
      cancelText: 'Keep Editing'
    }
  )
  
  if (confirmed) {
    zineStore.reset()
    view.value = 'init'
    toast.info('Project reset')
  }
}

// Generate thumbnail from first page
const generateThumbnail = async () => {
  try {
    if (zineStore.pages.length === 0) return null
    
    const firstPage = zineStore.pages[0]
    const pageElement = document.querySelector(`.page-canvas[data-page-id="${firstPage.id}"]`)
    if (!pageElement) return null
    
    // Temporarily hide guides
    pageElement.classList.add('export-mode')
    const guidesElement = pageElement.querySelector('.guides')
    const creaseElement = pageElement.querySelector('.page-crease')
    if (guidesElement) guidesElement.style.display = 'none'
    if (creaseElement) creaseElement.style.display = 'none'
    
    const canvas = await html2canvas(pageElement, {
      scale: 0.5, // Lower scale for thumbnail
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    
    // Restore guides
    if (guidesElement) guidesElement.style.display = ''
    if (creaseElement) creaseElement.style.display = ''
    pageElement.classList.remove('export-mode')
    
    return canvas.toDataURL('image/jpeg', 0.8) // Use JPEG with 80% quality for smaller size
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return null
  }
}

const handleSave = async () => {
  if (!zineStore.isInitialized) {
    toast.warning('No project to save')
    return
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    toast.warning('Please sign in to save your project', 'Sign In Required')
    return
  }
  
  // Prevent saving demo projects
  if (zineStore.projectMeta.id === 'demo') {
    const confirmed = await confirm(
      'This is a demo project. Would you like to sign in to save it as your own?',
      {
        title: 'Demo Project',
        type: 'info',
        confirmText: 'Sign In',
        cancelText: 'Cancel'
      }
    )
    if (confirmed) {
      handleRequireLogin('save')
    }
    return
  }

  // Should have ID from initialization, but fallback just in case
  const id = zineStore.projectMeta.id || `book-${Date.now()}`
  const title = zineStore.projectMeta.title || 'Untitled Zine'

  isSaving.value = true
  
  // Generate thumbnail
  const thumbnail = await generateThumbnail()

  const payload = {
    id,
    title,
    thumbnail, // Include thumbnail
    data: zineStore.exportProjectData(),
    metadata: {
      pageCount: zineStore.pageCount,
      mediaCount: zineStore.mediaAssets.length,
    },
  }
  saveBook(payload)
    .then((saved) => {
      zineStore.setProjectMeta({ id: saved.id, title: saved.title, updatedAt: saved.updatedAt })
      hasUnsavedChanges.value = false // Mark as saved
      view.value = 'editor'
      toast.success(`Saved "${saved.title}"`)
    })
    .catch((error) => {
      console.error('Failed to save project:', error)
      toast.error(error.message, 'Save Failed')
    })
    .finally(() => {
      isSaving.value = false
    })
}

const handleLoad = () => {
  showLibrary.value = true
}

const handleDeletePage = async (pageId) => {
  const pageIndex = zineStore.pages.findIndex(p => p.id === pageId)
  if (pageIndex === -1) return
  
  const confirmed = await confirm(
    `Delete page ${pageIndex + 1}? This cannot be undone.`,
    {
      title: 'Delete Page?',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }
  )
  
  if (confirmed) {
    zineStore.removePage(pageId)
    toast.info('Page deleted')
  }
}

const handleLoadFromLibrary = (book) => {
  if (!book || !book.data) {
    toast.error('Invalid book data')
    return
  }

  try {
    zineStore.importFromJSON(book.data, {
      meta: {
        id: book.id,
        title: book.title,
        updatedAt: book.updatedAt,
      },
    })
    hasUnsavedChanges.value = false // Loaded project starts as saved
    view.value = 'editor'
    showLibrary.value = false
    toast.success(`Loaded "${book.title || book.id}"`)
  } catch (error) {
    console.error('Failed to import book:', error)
    toast.error(error.message, 'Load Failed')
  }
}

const openCommandBar = () => {
  commandBar.value?.open()
}
const startNewProject = async () => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    const confirmed = await confirm(
      'You have unsaved changes that will be lost.',
      {
        title: 'Unsaved Changes',
        type: 'warning',
        confirmText: 'Start New',
        cancelText: 'Cancel'
      }
    )
    if (!confirmed) return
  }
  hasUnsavedChanges.value = false
  view.value = 'init'
}

const startDemoMode = async () => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    const confirmed = await confirm(
      'You have unsaved changes that will be lost.',
      {
        title: 'Unsaved Changes',
        type: 'warning',
        confirmText: 'Start Demo',
        cancelText: 'Cancel'
      }
    )
    if (!confirmed) return
  }
  
  // Load demo photobook
  const demoConfig = {
    format: 'A5-Landscape',
    width: 210,
    height: 148,
    unit: 'mm',
    margin: 5,
    bleed: 0,
    bindingType: 'folded'
  }
  
  zineStore.initializeZine(demoConfig)
  zineStore.setProjectMeta({
    id: 'demo',
    title: 'Demo Photobook',
    updatedAt: new Date().toISOString()
  })
  
  // Add preloaded demo images from Unsplash
  const demoImages = [
    {
      id: 'demo-img-1',
      name: 'Street Photography 1',
      url: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    },
    {
      id: 'demo-img-2',
      name: 'Street Photography 2',
      url: 'https://images.unsplash.com/photo-1526481280695-3c4693f1b8d9?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1526481280695-3c4693f1b8d9?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    },
    {
      id: 'demo-img-3',
      name: 'Street Photography 3',
      url: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    },
    {
      id: 'demo-img-4',
      name: 'Street Photography 4',
      url: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    },
    {
      id: 'demo-img-5',
      name: 'Street Photography 5',
      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    },
    {
      id: 'demo-img-6',
      name: 'Street Photography 6',
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=200&q=80',
      type: 'image/jpeg'
    }
  ]
  
  // Add demo images to media assets
  demoImages.forEach(img => zineStore.addMediaAsset(img))
  
  // Add some sample pages with layouts
  zineStore.addPage({
    type: 'full-page',
    slots: [{ x: 0, y: 0, width: 100, height: 100, type: 'image' }],
    textElements: []
  })
  
  zineStore.addPage({
    type: 'two-horizontal',
    slots: [
      { x: 0, y: 0, width: 50, height: 100, type: 'image' },
      { x: 50, y: 0, width: 50, height: 100, type: 'image' }
    ],
    textElements: []
  })
  
  zineStore.addPage({
    type: 'three-vertical',
    slots: [
      { x: 0, y: 0, width: 100, height: 33.33, type: 'image' },
      { x: 0, y: 33.33, width: 100, height: 33.33, type: 'image' },
      { x: 0, y: 66.67, width: 100, height: 33.33, type: 'image' }
    ],
    textElements: []
  })
  
  hasUnsavedChanges.value = false
  view.value = 'editor'
}

const handleRequireLogin = (action) => {
  const messages = {
    create: 'Sign in to create and save your own projects.',
    library: 'Sign in to access your saved projects.',
    layouts: 'Sign in to create custom layouts.',
    save: 'Sign in to save your work.'
  }
  
  alert(messages[action] || 'Please sign in to continue.')
  // TODO: Show proper login modal/redirect instead of alert
}

const navigateToDocs = () => {
  window.open('https://github.com/praneetmehta/zino', '_blank')
}

const goHome = async () => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    const confirmed = await confirm(
      'You have unsaved changes that will be lost.',
      {
        title: 'Return to Home?',
        type: 'warning',
        confirmText: 'Go Home',
        cancelText: 'Cancel'
      }
    )
    if (!confirmed) return
  }
  hasUnsavedChanges.value = false
  view.value = 'landing'
  zineStore.reset()
}

const navigateToLayoutBuilder = () => {
  view.value = 'layout-library'
}

const handleSaveLayout = async (layout) => {
  try {
    // Save layout to server using API
    const { saveCustomLayout } = await import('./api/layouts.js')
    const result = await saveCustomLayout(layout)

    // Auto-enable the new layout
    const enabledLayouts = JSON.parse(localStorage.getItem('enabledLayouts') || '[]')
    if (!enabledLayouts.includes(layout.id)) {
      enabledLayouts.push(layout.id)
      localStorage.setItem('enabledLayouts', JSON.stringify(enabledLayouts))
    }

    // Go back to layout library
    view.value = 'layout-library'
    
    // Show success message
    toast.success(`Layout "${layout.name}" saved successfully!`)
  } catch (error) {
    console.error('Failed to save layout:', error)
    toast.error(error.message || 'Failed to save layout', 'Save Failed')
  }
}

const lastSavedSummary = computed(() => {
  if (!zineStore.projectMeta?.id) return ''
  const updated = formatRelativeTime(zineStore.projectMeta.updatedAt)
  if (!updated) return `${zineStore.projectMeta.title || zineStore.projectMeta.id}`
  return `${zineStore.projectMeta.title || zineStore.projectMeta.id} • ${updated}`
})

// Listen for show-publications event from UserProfile
onMounted(() => {
  // Initialize notification system
  if (toastRef.value) {
    setToastInstance(toastRef.value)
  }
  if (confirmRef.value) {
    setConfirmInstance(confirmRef.value)
  }
  if (pdfProgressRef.value) {
    // PDF progress ref is ready
  }

  window.addEventListener('show-publications', () => {
    showPublications.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('show-publications', () => {
    showPublications.value = true
  })
})
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.bottom-hints {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.command-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--panel-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-hint:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.shortcuts-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: var(--panel-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text);
  font-size: 16px;
}

.shortcuts-hint:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.command-hint kbd {
  padding: 6px 10px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  font-family: monospace;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
}

.command-hint span {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

/* Flipbook Modal */
.flipbook-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.flipbook-modal-content {
  position: relative;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background: var(--panel-bg-solid);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--danger);
  color: white;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--danger-strong);
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
