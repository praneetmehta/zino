<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="dialog-overlay" @click.self="handleCancel">
        <div class="dialog">
          <button class="dialog-close" @click="handleCancel">✕</button>
          
          <div v-if="icon" class="dialog-icon" :class="`dialog-icon-${type}`">
            {{ icon }}
          </div>
          
          <div class="dialog-content">
            <h3 v-if="title" class="dialog-title">{{ title }}</h3>
            <p class="dialog-message">{{ message }}</p>
          </div>
          
          <div class="dialog-actions">
            <button
              class="btn btn-outline"
              @click="handleCancel"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              class="btn"
              :class="confirmClass"
              @click="handleConfirm"
              :disabled="loading"
            >
              <span v-if="loading">⏳ </span>{{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const isOpen = ref(false)
const title = ref('')
const message = ref('')
const type = ref('info')
const icon = ref(null)
const confirmText = ref('OK')
const cancelText = ref('Cancel')
const loading = ref(false)
let resolvePromise = null

const confirmClass = computed(() => {
  if (type.value === 'danger') return 'btn-danger'
  return 'btn-primary'
})

function open(options) {
  return new Promise((resolve) => {
    isOpen.value = true
    title.value = options.title || ''
    message.value = options.message || ''
    type.value = options.type || 'info'
    icon.value = options.icon || getDefaultIcon(options.type)
    confirmText.value = options.confirmText || 'OK'
    cancelText.value = options.cancelText || 'Cancel'
    loading.value = false
    resolvePromise = resolve
  })
}

function getDefaultIcon(dialogType) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🗑️',
    success: '✓'
  }
  return icons[dialogType] || '❓'
}

function handleConfirm() {
  if (resolvePromise) {
    resolvePromise(true)
    resolvePromise = null
  }
  isOpen.value = false
}

function handleCancel() {
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
  isOpen.value = false
}

// Expose methods
defineExpose({
  open
})
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99998;
  padding: 24px;
}

.dialog {
  background: var(--panel-bg);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  position: relative;
  animation: dialogSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--muted);
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: var(--border);
  transform: scale(1.1);
}

.dialog-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 20px;
}

.dialog-icon-info {
  background: color-mix(in srgb, #3b82f6 20%, transparent);
}

.dialog-icon-warning {
  background: color-mix(in srgb, #f59e0b 20%, transparent);
}

.dialog-icon-danger {
  background: color-mix(in srgb, #ef4444 20%, transparent);
}

.dialog-icon-success {
  background: color-mix(in srgb, #10b981 20%, transparent);
}

.dialog-content {
  text-align: center;
  margin-bottom: 24px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.dialog-message {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  white-space: pre-line;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-actions .btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  border-color: #dc2626;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
