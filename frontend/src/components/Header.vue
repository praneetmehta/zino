<template>
  <header class="header">
    <div class="header-left">
      <button
        v-if="showBack"
        class="back-btn"
        @click="$emit('go-home')"
        title="Return to landing page"
      >
        ← Menu
      </button>
      <h1>📚 Ziner</h1>
      <div class="zine-info" v-if="zineStore.zineConfig">
        <span>{{ zineStore.zineConfig.width }} × {{ zineStore.zineConfig.height }} {{ zineStore.zineConfig.unit }}</span>
        <span class="separator">•</span>
        <span>{{ zineStore.pageCount }} pages</span>
        <template v-if="projectTitle">
          <span class="separator">•</span>
          <span>"{{ projectTitle }}"</span>
        </template>
        <template v-if="lastSaved">
          <span class="separator">•</span>
          <span>Saved {{ lastSaved }}</span>
        </template>
        <span v-if="hasUnsavedChanges" class="unsaved-indicator" title="You have unsaved changes">
          <span class="separator">•</span>
          <span class="unsaved-dot">●</span> Unsaved
        </span>
      </div>
    </div>
    
    <div class="header-right">
      <div class="toggles">
        <label class="switch" title="Toggle dark mode">
          <input type="checkbox" :checked="zineStore.ui.theme==='dark'" @change="zineStore.toggleTheme()" />
          <span class="slider"></span>
          <span class="label">Dark</span>
        </label>
        <label class="switch" title="Show guides (margin/trim)">
          <input type="checkbox" :checked="zineStore.ui.showGuides" @change="zineStore.toggleGuides()" />
          <span class="slider"></span>
          <span class="label">Guides</span>
        </label>
      </div>
      <button class="btn btn-outline" @click="openDocs">
        📘 Docs
      </button>
      <button class="btn btn-outline" @click="$emit('save')" data-action="save" :disabled="!zineStore.isInitialized || saving">
        <span v-if="saving">⏳ Saving…</span>
        <span v-else>💾 Save</span>
      </button>
      <button class="btn btn-outline" @click="$emit('load')" data-action="load" :disabled="loading">
        <span v-if="loading">🔍 Loading…</span>
        <span v-else>📂 Load</span>
      </button>
      <button class="btn btn-primary" @click="$emit('export')" :disabled="zineStore.pageCount === 0">
        📥 Export PDF
      </button>
      <UserProfile />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useZineStore } from '../stores/zineStore'
import UserProfile from './UserProfile.vue'

const props = defineProps({
  saving: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showBack: { type: Boolean, default: false },
  hasUnsavedChanges: { type: Boolean, default: false },
})

const zineStore = useZineStore()
defineEmits(['export', 'reset', 'save', 'load', 'go-home'])

const projectTitle = computed(() => zineStore.projectMeta.title?.trim() || '')

const lastSaved = computed(() => {
  const iso = zineStore.projectMeta.updatedAt
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
})

const openDocs = () => {
  window.open('https://github.com/praneetmehta/ziner#usage', '_blank')
}
</script>

<style scoped>
.header {
  height: 72px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: background var(--transition), border-color var(--transition);
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  border: 1px solid var(--border);
  background: var(--panel-bg);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--text);
  border-color: var(--accent);
  transform: translateX(-3px);
}

.header-left h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.02em;
  transition: color var(--transition);
}

.zine-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  background: var(--muted);
  border-radius: 20px;
  transition: all var(--transition);
}

.separator {
  color: var(--border);
}

.unsaved-indicator {
  color: #f59e0b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unsaved-dot {
  color: #f59e0b;
  font-size: 10px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.toggles {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-right: 8px;
}

.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.switch input { display: none; }

.switch .slider {
  width: 40px;
  height: 22px;
  background: var(--border);
  border-radius: 999px;
  position: relative;
  transition: background .3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 3px rgba(0,0,0,.1);
}

.switch .slider::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 18px; height: 18px;
  background: var(--panel-bg);
  border-radius: 50%;
  transition: transform .3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,.15);
}

.switch input:checked + .slider {
  background: var(--accent);
}

.switch input:checked + .slider::after {
  transform: translateX(18px);
}

.switch .label { 
  font-size: 12px; 
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition);
}
</style>
