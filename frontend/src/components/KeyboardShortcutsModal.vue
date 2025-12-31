<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content shortcuts-modal">
        <div class="modal-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button class="close-btn" @click="$emit('close')" title="Close (Esc)">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="shortcuts-section">
            <h3>General</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>K</kbd>
                </div>
                <div class="shortcut-description">Open command bar</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>S</kbd>
                </div>
                <div class="shortcut-description">Save project</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>F</kbd>
                </div>
                <div class="shortcut-description">Preview flipbook</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>?</kbd>
                </div>
                <div class="shortcut-description">Show this help</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>Esc</kbd>
                </div>
                <div class="shortcut-description">Close dialogs</div>
              </div>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>Pages</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>C</kbd>
                </div>
                <div class="shortcut-description">Copy selected page</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>V</kbd>
                </div>
                <div class="shortcut-description">Paste page</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>D</kbd>
                </div>
                <div class="shortcut-description">Duplicate page</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>Delete</kbd>
                </div>
                <div class="shortcut-description">Delete selected page</div>
              </div>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>Canvas</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>+</kbd>
                </div>
                <div class="shortcut-description">Zoom in</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>-</kbd>
                </div>
                <div class="shortcut-description">Zoom out</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>0</kbd>
                </div>
                <div class="shortcut-description">Reset zoom (100%)</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>Space</kbd>
                </div>
                <div class="shortcut-description">Pan canvas (hold & drag)</div>
              </div>
            </div>
          </div>

          <div class="shortcuts-section">
            <h3>Text Editing</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>B</kbd>
                </div>
                <div class="shortcut-description">Bold text</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>I</kbd>
                </div>
                <div class="shortcut-description">Italic text</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>⌘</kbd><kbd>U</kbd>
                </div>
                <div class="shortcut-description">Underline text</div>
              </div>
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  <kbd>Esc</kbd>
                </div>
                <div class="shortcut-description">Exit text editing</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p class="hint">💡 Press <kbd>?</kbd> anytime to view shortcuts</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false }
})

defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.modal-content {
  background: var(--panel-bg-solid);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shortcuts-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--muted);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--danger);
  color: white;
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.shortcuts-section h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  background: var(--muted);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.shortcut-item:hover {
  background: var(--border);
  transform: translateX(4px);
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.shortcut-keys kbd {
  padding: 6px 10px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  font-family: monospace;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  min-width: 32px;
  text-align: center;
}

.shortcut-description {
  flex: 1;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}

.hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hint kbd {
  padding: 4px 8px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  font-family: monospace;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-body {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
