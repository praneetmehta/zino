<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2>🚀 Publish Template</h2>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">Template Name *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="e.g., Wedding Album, Travel Journal"
                required
              />
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                v-model="formData.description"
                placeholder="Describe your template..."
                rows="3"
                required
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" v-model="formData.category" required>
                  <option value="">Select category</option>
                  <option value="photobook">Photobook</option>
                  <option value="magazine">Magazine</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="catalog">Catalog</option>
                  <option value="lookbook">Lookbook</option>
                  <option value="cookbook">Cookbook</option>
                  <option value="wedding">Wedding</option>
                  <option value="travel">Travel</option>
                </select>
              </div>

              <div class="form-group">
                <label for="price">Price (USD) *</label>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="tags">Tags (comma separated)</label>
              <input
                id="tags"
                v-model="tagsInput"
                type="text"
                placeholder="e.g., elegant, modern, minimal"
              />
            </div>

            <div class="form-group">
              <label>Auto-filled Information</label>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Pages:</span>
                  <span class="info-value">{{ pageCount }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Dimensions:</span>
                  <span class="info-value">{{ dimensions }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Bleed:</span>
                  <span class="info-value">{{ bleed }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Binding:</span>
                  <span class="info-value">{{ binding }}</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="$emit('close')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!isValid">
                Publish Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useZineStore } from '../stores/zineStore'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'publish'])

const zineStore = useZineStore()

const formData = ref({
  name: '',
  description: '',
  category: '',
  price: 0,
  thumbnail: ''
})

const tagsInput = ref('')

const pageCount = computed(() => zineStore.pageCount)
const dimensions = computed(() => {
  const config = zineStore.zineConfig
  return `${config.width} × ${config.height} ${config.unit}`
})
const bleed = computed(() => `${zineStore.zineConfig.bleed} ${zineStore.zineConfig.unit}`)
const binding = computed(() => zineStore.zineConfig.bindingType || 'folded')

const isValid = computed(() => {
  return formData.value.name.trim() &&
         formData.value.description.trim() &&
         formData.value.category &&
         formData.value.price >= 0
})

const handleSubmit = () => {
  if (!isValid.value) return

  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const metadata = {
    ...formData.value,
    tags,
    id: `template-${Date.now()}`
  }

  emit('publish', metadata)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-container {
  background: var(--panel-bg-solid);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--muted);
  color: var(--text);
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--danger);
  color: white;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: var(--muted);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
