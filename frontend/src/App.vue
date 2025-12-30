<template>
  <div class="app" :class="`theme-${zineStore.ui.theme}`" :data-theme="zineStore.ui.theme">
    <LandingPage
      v-if="view === 'landing'"
      :loading="isLoadingRemote"
      :last-saved-summary="lastSavedSummary"
      @create-new="startNewProject"
      @load-book="handleLoad"
      @open-layout-builder="navigateToLayoutBuilder"
      @open-docs="navigateToDocs"
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
        :loading="isLoadingRemote"
        :show-back="view !== 'landing'"
        :has-unsaved-changes="hasUnsavedChanges"
        @go-home="goHome"
        @export="handleExport"
        @reset="handleReset"
        @save="handleSave"
        @load="handleLoad"
      />
      <div class="workspace">
        <MediaPanel @collapsed-change="mediaPanelCollapsed = $event" />
        <Canvas 
          :media-panel-collapsed="mediaPanelCollapsed" 
          :page-panel-collapsed="pagePanelCollapsed" 
        />
        <PagePanel @collapsed-change="pagePanelCollapsed = $event" />
      </div>
      <div class="command-hint" @click="openCommandBar">
        <kbd>⌘K</kbd>
        <span>Command Bar</span>
      </div>
    </template>
    <CommandBar
      v-if="view === 'editor'"
      ref="commandBar"
      @export="handleExport"
      @reset="handleReset"
      @save="handleSave"
      @load="handleLoad"
      @flipbook="showFlipbook = true"
    />
    
    <!-- Flipbook Modal -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useZineStore } from './stores/zineStore'
import InitModal from './components/InitModal.vue'
import Header from './components/Header.vue'
import MediaPanel from './components/MediaPanel.vue'
import Canvas from './components/Canvas.vue'
import PagePanel from './components/PagePanel.vue'
import CommandBar from './components/CommandBar.vue'
import FlipBook from './components/FlipBook.vue'
import LandingPage from './components/LandingPage.vue'
import LibraryModal from './components/LibraryModal.vue'
import LayoutBuilder from './components/LayoutBuilder.vue'
import LayoutLibrary from './components/LayoutLibrary.vue'
import { exportToPDF } from './utils/pdfExport'
import { listBooks, saveBook, getBook } from './api/books'

const zineStore = useZineStore()
const commandBar = ref(null)
const showFlipbook = ref(false)
const isSaving = ref(false)
const isLoadingRemote = ref(false)
const view = ref('landing') // landing | init | editor
const showLibrary = ref(false)
const mediaPanelCollapsed = ref(false)
const pagePanelCollapsed = ref(false)
const hasUnsavedChanges = ref(false)

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

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
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

const handleInitialize = (config) => {
  zineStore.initializeZine(config)
  zineStore.setProjectMeta({ id: null, title: '', updatedAt: null })
  hasUnsavedChanges.value = false // New project starts as saved
  view.value = 'editor'
}

const handleExport = () => {
  exportToPDF(zineStore)
}

const handleReset = () => {
  if (confirm('Are you sure you want to reset? All progress will be lost.')) {
    zineStore.reset()
    view.value = 'init'
  }
}

const handleSave = () => {
  if (!zineStore.isInitialized) {
    alert('Initialize your zine before saving.')
    return
  }

  const defaultId = zineStore.projectMeta.id || `book-${Date.now()}`
  const idInput = window.prompt('Enter a book ID to save:', defaultId)
  if (!idInput) return

  const defaultTitle = zineStore.projectMeta.title || 'Untitled Postcard'
  const titleInput = window.prompt('Enter a title for this book:', defaultTitle)
  if (titleInput === null) return

  const id = idInput.trim()
  const title = (titleInput || 'Untitled').trim()
  if (!id) {
    alert('Book ID cannot be empty.')
    return
  }

  const payload = {
    id,
    title,
    data: zineStore.exportProjectData(),
    metadata: {
      pageCount: zineStore.pageCount,
      mediaCount: zineStore.mediaAssets.length,
    },
  }
  isSaving.value = true
  saveBook(payload)
    .then((saved) => {
      zineStore.setProjectMeta({ id: saved.id, title: saved.title, updatedAt: saved.updatedAt })
      hasUnsavedChanges.value = false // Mark as saved
      view.value = 'editor'
      alert(`Saved "${saved.title}" (${saved.id})`) // user feedback
    })
    .catch((error) => {
      console.error('Failed to save project:', error)
      alert(`Failed to save project: ${error.message}`)
    })
    .finally(() => {
      isSaving.value = false
    })
}

const handleLoad = () => {
  showLibrary.value = true
}

const handleLoadFromLibrary = (book) => {
  if (!book || !book.data) {
    alert('Invalid book data')
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
  } catch (error) {
    console.error('Failed to import book:', error)
    alert(`Failed to load book: ${error.message}`)
  }
}

const openCommandBar = () => {
  commandBar.value?.open()
}
const startNewProject = () => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    if (!confirm('You have unsaved changes. Start a new project anyway?')) {
      return
    }
  }
  hasUnsavedChanges.value = false
  view.value = 'init'
}

const goHome = () => {
  if (hasUnsavedChanges.value && zineStore.isInitialized) {
    if (!confirm('You have unsaved changes. Return to home anyway?')) {
      return
    }
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
    // Save layout to server
    const response = await fetch('http://localhost:4876/layouts/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save layout')
    }

    // Auto-enable the new layout
    const enabledLayouts = JSON.parse(localStorage.getItem('enabledLayouts') || '[]')
    if (!enabledLayouts.includes(layout.id)) {
      enabledLayouts.push(layout.id)
      localStorage.setItem('enabledLayouts', JSON.stringify(enabledLayouts))
    }

    // Go back to layout library
    view.value = 'layout-library'

    // Show success message
    alert(`Layout "${layout.name}" saved successfully!`)
  } catch (error) {
    console.error('Failed to save layout:', error)
    alert(`Failed to save layout: ${error.message}`)
  }
}

const navigateToDocs = () => {
  window.open('https://github.com/praneetmehta/ziner#usage', '_blank')
}

const lastSavedSummary = computed(() => {
  if (!zineStore.projectMeta?.id) return ''
  const updated = formatRelativeTime(zineStore.projectMeta.updatedAt)
  if (!updated) return `${zineStore.projectMeta.title || zineStore.projectMeta.id}`
  return `${zineStore.projectMeta.title || zineStore.projectMeta.id} • ${updated}`
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

.command-hint {
  position: fixed;
  bottom: 24px;
  right: 24px;
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
  z-index: 100;
}

.command-hint:hover {
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
