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
      <h1>📚 Zino</h1>
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
        <!-- Theme Toggle with Sun/Moon Icons -->
        <button 
          class="btn btn-icon theme-toggle" 
          @click="zineStore.toggleTheme()" 
          :title="zineStore.ui.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="zineStore.ui.theme === 'light'" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1V2M9 16V17M17 9H16M2 9H1M14.5 14.5L13.79 13.79M4.21 4.21L3.5 3.5M14.5 3.5L13.79 4.21M4.21 13.79L3.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="9" cy="9" r="3.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M16 10.5C15.1 11.3 13.9 11.8 12.6 11.8C9.5 11.8 7 9.3 7 6.2C7 4.9 7.5 3.7 8.3 2.8C5.1 3.3 2.6 6 2.6 9.4C2.6 13.1 5.6 16.1 9.3 16.1C12.7 16.1 15.4 13.6 15.9 10.4L16 10.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Flipbook Preview Button -->
        <button 
          class="btn btn-icon" 
          @click="$emit('flipbook')" 
          :disabled="zineStore.pageCount === 0"
          title="Preview flipbook (Cmd+F)"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3H11L15 7V15H3V3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 3V7H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 9H12M6 12H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <button class="btn btn-outline" @click="$emit('save')" data-action="save" :disabled="!zineStore.isInitialized || saving">
        <span v-if="saving">⏳ Saving…</span>
        <span v-else>💾 Save</span>
      </button>
      <button class="btn btn-outline" @click="$emit('export')" :disabled="zineStore.pageCount === 0">
        📥 Export PDF
      </button>
      <button class="btn btn-primary" @click="$emit('publish')" :disabled="zineStore.pageCount === 0 || publishing">
        <span v-if="publishing">⏳ Publishing…</span>
        <span v-else>🚀 Publish</span>
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
  publishing: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showBack: { type: Boolean, default: false },
  hasUnsavedChanges: { type: Boolean, default: false },
})

const zineStore = useZineStore()
defineEmits(['export', 'publish', 'reset', 'save', 'load', 'go-home', 'flipbook'])

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

/* Icon Buttons */
.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover:not(:disabled) {
  background: var(--border);
  transform: translateY(-1px);
}

.btn-icon:active:not(:disabled) {
  transform: translateY(0);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.theme-toggle {
  position: relative;
}

.theme-toggle svg {
  transition: all 0.3s ease;
}

.theme-toggle:hover:not(:disabled) svg {
  transform: rotate(20deg) scale(1.1);
}
</style>
