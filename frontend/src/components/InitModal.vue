<template>
  <div class="modal-overlay">
    <div class="modal modal-with-preview">
      <div class="modal-content">
        <h2>Create New Zine</h2>
        <p class="modal-description">Name your zine and configure dimensions. All settings can be adjusted later.</p>
        <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Zine Title</label>
          <input
            v-model="config.title"
            type="text"
            placeholder="My Awesome Zine"
            required
            maxlength="100"
          />
          <small>Give your zine a name to get started</small>
        </div>

        <div class="form-group">
          <label>Page Dimensions (Full Spread)</label>
          <div class="dimension-inputs">
            <input
              v-model.number="config.width"
              type="number"
              placeholder="Width"
              required
              min="1"
            />
            <span>×</span>
            <input
              v-model.number="config.height"
              type="number"
              placeholder="Height"
              required
              min="1"
            />
            <select v-model="config.unit">
              <option value="mm">mm</option>
              <option value="px">px</option>
            </select>
          </div>
          <small class="info-text">💡 For folded zines, enter the <strong>full spread size</strong> (both pages side-by-side), not individual page size.</small>
        </div>

        <div class="form-group">
          <label>Bleed ({{ config.unit }})</label>
          <input
            v-model.number="config.bleed"
            type="number"
            placeholder="0"
            min="0"
          />
          <small>Extra space around the page edges that will be trimmed after printing. Standard is 3mm.</small>
        </div>

        <div class="form-group">
          <label>Margin (Safe Area) ({{ config.unit }}) <span class="percentage-hint" v-if="marginPercentage">≈ {{ marginPercentage }}% of page width</span></label>
          <input
            v-model.number="config.margin"
            type="number"
            placeholder="0"
            min="0"
          />
          <small>Keep content within this distance from edges. Creates spacing between placeholders and around page edges. Recommended: 2-5mm.</small>
        </div>

        <div class="form-group">
          <label>Default Placeholder Inner Margin (%)</label>
          <input
            v-model.number="config.slotInnerMarginPercent"
            type="number"
            placeholder="0"
            min="0"
            max="20"
          />
          <small>Applied inside each placeholder by default. You can tweak per placeholder later.</small>
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Create Zine</button>
        </div>
      </form>
      </div>
      
      <!-- Live Preview -->
      <div class="preview-panel">
        <h3>Preview</h3>
        <div class="preview-container">
          <div class="preview-canvas">
            <!-- Page with bleed -->
            <div 
              class="preview-page"
              :style="previewStyle"
            >
              <!-- Bleed area -->
              <div class="preview-bleed" v-if="config.bleed > 0"></div>
              
              <!-- Safe area (margin) -->
              <div 
                class="preview-margin"
                :style="{
                  inset: `${marginPercent}%`
                }"
                v-if="config.margin > 0"
              ></div>
              
              <!-- Center fold line (only for folded binding type) -->
              <div class="preview-fold" v-if="config.bindingType === 'folded'"></div>
            </div>
          </div>
          
          <!-- Dimensions info -->
          <div class="preview-info">
            <div class="info-item">
              <span class="label">Full Spread:</span>
              <span class="value">{{ config.width }} × {{ config.height }} {{ config.unit }}</span>
            </div>
            <div class="info-item">
              <span class="label">Single Page:</span>
              <span class="value">{{ config.width / 2 }} × {{ config.height }} {{ config.unit }}</span>
            </div>
            <div class="info-item" v-if="config.bleed > 0">
              <span class="label">Bleed:</span>
              <span class="value">{{ config.bleed }} {{ config.unit }}</span>
            </div>
            <div class="info-item" v-if="config.margin > 0">
              <span class="label">Safe Area:</span>
              <span class="value">{{ config.margin }} {{ config.unit }}</span>
            </div>
          </div>
        </div>

        <!-- Binding Type -->
        <div class="form-group">
          <label>Binding Type</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" value="folded" v-model="config.bindingType" />
              <span>Folded (Center Fold)</span>
            </label>
            <label class="radio-option">
              <input type="radio" value="flat" v-model="config.bindingType" />
              <span>Flat (No Fold)</span>
            </label>
          </div>
          <small>How pages are bound together. Folded shows a center crease.</small>
        </div>

        <!-- Size Presets -->
        <div class="form-group">
          <label>Size Presets</label>
          <div class="preset-buttons">
            <button type="button" class="btn btn-outline" @click="applyPreset('postcard')">
              Postcard (148×100mm)
            </button>
            <button type="button" class="btn btn-outline" @click="applyPreset('a4')">
              A4 Portrait (210×297mm)
            </button>
            <button type="button" class="btn btn-outline" @click="applyPreset('a4landscape')">
              A4 Landscape (297×210mm)
            </button>
            <button type="button" class="btn btn-outline" @click="applyPreset('a5')">
              A5 (148×210mm)
            </button>
            <button type="button" class="btn btn-outline" @click="applyPreset('letter')">
              Letter (216×279mm)
            </button>
            <button type="button" class="btn btn-outline" @click="applyPreset('square')">
              Square (200×200mm)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const emit = defineEmits(['initialize'])

const config = reactive({
  title: '',
  width: 148,
  height: 100,
  unit: 'mm',
  bleed: 3,
  margin: 2,
  slotInnerMarginPercent: 0,
  bindingType: 'folded',
})

const presets = {
  postcard: { width: 148, height: 100, unit: 'mm' },
  a4: { width: 210, height: 297, unit: 'mm' },
  a4landscape: { width: 297, height: 210, unit: 'mm' },
  a5: { width: 148, height: 210, unit: 'mm' },
  letter: { width: 216, height: 279, unit: 'mm' },
  square: { width: 200, height: 200, unit: 'mm' },
}

const applyPreset = (preset) => {
  Object.assign(config, presets[preset])
}

const handleSubmit = () => {
  emit('initialize', { ...config })
}

// Computed preview styles
const previewStyle = computed(() => {
  const aspectRatio = config.width / config.height
  const maxWidth = 280
  const maxHeight = 200
  
  let width, height
  if (aspectRatio > maxWidth / maxHeight) {
    width = maxWidth
    height = maxWidth / aspectRatio
  } else {
    height = maxHeight
    width = maxHeight * aspectRatio
  }
  
  return {
    width: `${width}px`,
    height: `${height}px`
  }
})

const marginPercent = computed(() => {
  // Calculate margin as percentage of page dimension
  const avgDimension = (config.width + config.height) / 2
  return (config.margin / avgDimension) * 100
})

const marginPercentage = computed(() => {
  // Calculate margin as percentage of page width
  if (!config.width || !config.margin) return null
  const percentage = (config.margin / config.width) * 100
  return percentage.toFixed(1)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--panel-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  border-radius: 20px;
  padding: 40px;
  width: 90%;
  max-width: 540px;
  box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.2);
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  position: relative;
}

.modal-with-preview {
  max-width: 1000px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  padding: 40px;
}

.modal::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal h2 {
  margin-bottom: 12px;
  color: var(--text-strong);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.modal-description {
  margin-bottom: 28px;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.percentage-hint {
  font-weight: 500;
  color: var(--accent);
  font-size: 13px;
  margin-left: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  background: var(--muted);
  color: var(--text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--panel-bg);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.form-group .info-text {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-left: 3px solid var(--accent);
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.form-group .info-text strong {
  color: var(--text);
  font-weight: 600;
}

.dimension-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dimension-inputs input {
  flex: 1;
}

.dimension-inputs select {
  width: 80px;
}

.dimension-inputs span {
  color: #6b7280;
  font-weight: 500;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--muted);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.radio-option:hover {
  border-color: var(--accent);
  background: var(--panel-bg);
}

.radio-option input[type="radio"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.radio-option input[type="radio"]:checked + span {
  color: var(--text-strong);
  font-weight: 600;
}

.radio-option span {
  color: var(--text);
  font-size: 14px;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-actions .btn {
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 600;
}

/* Preview Panel */
.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-panel .form-group {
  margin-bottom: 0;
}

.preview-panel .form-group label {
  font-size: 13px;
  margin-bottom: 8px;
}

.preview-panel .radio-option {
  padding: 10px 14px;
}

.preview-panel .radio-option span {
  font-size: 13px;
}

.preview-panel small {
  font-size: 11px;
  margin-top: 4px;
}

.preview-panel .btn-outline {
  padding: 8px 12px;
  font-size: 12px;
}

.preview-panel h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-canvas {
  background: var(--muted);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border: 1px solid var(--border);
}

.preview-page {
  background: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.preview-bleed {
  position: absolute;
  inset: -8px;
  border: 2px dashed rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  pointer-events: none;
  background: rgba(239, 68, 68, 0.05);
}

.preview-margin {
  position: absolute;
  border: 2px dashed rgba(59, 130, 246, 0.4);
  border-radius: 2px;
  pointer-events: none;
  background: rgba(59, 130, 246, 0.05);
}

.preview-fold {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, 
    transparent 0%,
    rgba(0, 0, 0, 0.2) 10%,
    rgba(0, 0, 0, 0.2) 90%,
    transparent 100%
  );
  transform: translateX(-50%);
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--muted);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-item .label {
  color: var(--text-muted);
  font-weight: 500;
}

.info-item .value {
  color: var(--text);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 1024px) {
  .modal-with-preview {
    grid-template-columns: 1fr;
    max-width: 540px;
  }
  
  .preview-panel {
    order: -1; /* Show preview first on mobile */
  }
}
</style>
