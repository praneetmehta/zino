<template>
  <transition name="command-fade">
    <div v-if="isOpen" class="command-overlay" @click="close">
      <div class="command-bar" @click.stop>
        <div class="command-search">
          <span class="search-icon">⌘</span>
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            placeholder="Type a command or search..."
            @keydown.esc="close"
            @keydown.down.prevent="selectNext"
            @keydown.up.prevent="selectPrev"
            @keydown.enter.prevent="executeSelected"
          />
          <kbd class="kbd">ESC</kbd>
        </div>
        
        <div class="command-results" v-if="filteredCommands.length">
          <div
            v-for="(cmd, index) in filteredCommands"
            :key="cmd.id"
            class="command-item"
            :class="{ selected: index === selectedIndex }"
            @click="execute(cmd)"
            @mouseenter="selectedIndex = index"
          >
            <span class="command-icon">{{ cmd.icon }}</span>
            <div class="command-info">
              <div class="command-name">{{ cmd.name }}</div>
              <div class="command-desc">{{ cmd.description }}</div>
            </div>
            <kbd v-if="cmd.shortcut" class="kbd">{{ cmd.shortcut }}</kbd>
          </div>
        </div>
        
        <div v-else class="command-empty">
          <span>No commands found</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useZineStore } from '../stores/zineStore'

const zineStore = useZineStore()
const emit = defineEmits(['export', 'reset', 'save', 'load', 'flipbook'])

const isOpen = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref(null)

const commands = [
  { id: 'toggle-theme', name: 'Toggle Dark Mode', description: 'Switch between light and dark theme', icon: '🌓', shortcut: 'Cmd+D', action: () => zineStore.toggleTheme() },
  { id: 'toggle-guides', name: 'Toggle Guides', description: 'Show/hide margin and bleed guides', icon: '📐', shortcut: 'Cmd+G', action: () => zineStore.toggleGuides() },
  { id: 'flipbook', name: 'Flipbook Preview', description: 'View 3D flipbook animation', icon: '📖', shortcut: 'Cmd+F', action: () => emit('flipbook') },
  { id: 'export-pdf', name: 'Export PDF', description: 'Export your zine as PDF', icon: '📥', action: () => emit('export') },
  { id: 'save-json', name: 'Save Project', description: 'Save project as JSON', icon: '💾', shortcut: 'Cmd+S', action: () => emit('save') },
  { id: 'load-json', name: 'Load Project', description: 'Load project from JSON', icon: '📂', shortcut: 'Cmd+O', action: () => emit('load') },
  { id: 'reset', name: 'Reset Project', description: 'Clear all and start fresh', icon: '🔄', action: () => emit('reset') },
  { id: 'add-media', name: 'Add Media', description: 'Upload images to media pool', icon: '🖼️', shortcut: 'Cmd+U', action: () => {} },
]

const filteredCommands = computed(() => {
  if (!query.value) return commands
  const q = query.value.toLowerCase()
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(q) || 
    cmd.description.toLowerCase().includes(q)
  )
})

const open = () => {
  isOpen.value = true
  selectedIndex.value = 0
  query.value = ''
  setTimeout(() => searchInput.value?.focus(), 50)
}

const close = () => {
  isOpen.value = false
  query.value = ''
}

const selectNext = () => {
  selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length
}

const selectPrev = () => {
  selectedIndex.value = selectedIndex.value === 0 
    ? filteredCommands.value.length - 1 
    : selectedIndex.value - 1
}

const execute = (cmd) => {
  cmd.action()
  close()
}

const executeSelected = () => {
  if (filteredCommands.value[selectedIndex.value]) {
    execute(filteredCommands.value[selectedIndex.value])
  }
}

const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value ? close() : open()
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault()
    zineStore.toggleTheme()
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
    e.preventDefault()
    zineStore.toggleGuides()
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    emit('save')
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
    e.preventDefault()
    emit('load')
  }
}

watch(query, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({ open, close })
</script>

<style scoped>
.command-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 2000;
}

.command-bar {
  width: 90%;
  max-width: 640px;
  background: var(--panel-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  border-radius: 16px;
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.2);
  border: 1px solid var(--border);
  overflow: hidden;
  position: relative;
}

.command-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.command-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.search-icon {
  font-size: 20px;
  opacity: 0.6;
}

.command-search input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--text);
  outline: none;
}

.command-search input::placeholder {
  color: var(--text-muted);
}

.kbd {
  padding: 4px 8px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: monospace;
}

.command-results {
  max-height: 400px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.command-item:hover,
.command-item.selected {
  background: var(--muted);
  border-left-color: var(--accent);
}

.command-icon {
  font-size: 24px;
  width: 32px;
  text-align: center;
}

.command-info {
  flex: 1;
}

.command-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}

.command-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.command-empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.command-fade-enter-active,
.command-fade-leave-active {
  transition: opacity 0.2s ease;
}

.command-fade-enter-from,
.command-fade-leave-to {
  opacity: 0;
}

.command-fade-enter-active .command-bar {
  animation: commandSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes commandSlideUp {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
