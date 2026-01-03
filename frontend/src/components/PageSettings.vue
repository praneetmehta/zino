<template>
  <div class="page-settings">
    <!-- Page Dimensions -->
    <div class="setting-group">
            <label class="group-label">Page Dimensions</label>
            <div class="dimension-row">
              <div class="input-field" :class="{ 'has-error': widthError }">
                <label>Width</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.width" 
                  @input="validateDimension('width')"
                  @change="updateConfig"
                  min="10"
                  :max="localConfig.unit === 'mm' ? 400 : 1512"
                  step="1"
                  :title="localConfig.unit === 'mm' ? 'Maximum 400mm' : 'Maximum 1512px (~400mm)'"
                />
                <span class="unit">{{ localConfig.unit }}</span>
                <span v-if="widthError" class="error-hint">Max: {{ localConfig.unit === 'mm' ? '400mm' : '1512px' }}</span>
              </div>
              <div class="input-field" :class="{ 'has-error': heightError }">
                <label>Height</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.height" 
                  @input="validateDimension('height')"
                  @change="updateConfig"
                  min="10"
                  :max="localConfig.unit === 'mm' ? 400 : 1512"
                  step="1"
                  :title="localConfig.unit === 'mm' ? 'Maximum 400mm' : 'Maximum 1512px (~400mm)'"
                />
                <span class="unit">{{ localConfig.unit }}</span>
                <span v-if="heightError" class="error-hint">Max: {{ localConfig.unit === 'mm' ? '400mm' : '1512px' }}</span>
              </div>
            </div>
          </div>

          <!-- Margin -->
          <div class="setting-group">
            <label class="group-label">Margin (Safe Area)</label>
            <div class="input-field">
              <input 
                type="number" 
                v-model.number="localConfig.margin" 
                @change="updateConfig"
                min="0"
                step="0.5"
              />
              <span class="unit">{{ localConfig.unit }}</span>
            </div>
            <p class="help-text">
              <strong>How margins work:</strong><br>
              • Creates spacing around page edges<br>
              • Creates gaps between adjacent placeholders (2× margin)<br>
              • Typical values: 5-10mm for print, 10-20px for digital
            </p>
          </div>

          <!-- Bleed -->
          <div class="setting-group">
            <div class="group-header">
              <label class="group-label">Bleed (Print Extension)</label>
              <label class="toggle-uniform">
                <input 
                  type="checkbox" 
                  v-model="uniformBleed"
                  name="uniform-bleed"
                  id="uniform-bleed-toggle"
                />
                <span>Same for all sides</span>
              </label>
            </div>
            
            <div v-if="uniformBleed" class="input-field">
              <input 
                type="number" 
                v-model.number="localConfig.bleed" 
                @change="updateConfig"
                min="0"
                step="0.5"
              />
              <span class="unit">{{ localConfig.unit }}</span>
            </div>
            
            <div v-else class="bleed-grid">
              <div class="input-field">
                <label>Top</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.bleedTop" 
                  @change="updateConfig"
                  min="0"
                  step="0.5"
                />
                <span class="unit">{{ localConfig.unit }}</span>
              </div>
              <div class="input-field">
                <label>Right</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.bleedRight" 
                  @change="updateConfig"
                  min="0"
                  step="0.5"
                />
                <span class="unit">{{ localConfig.unit }}</span>
              </div>
              <div class="input-field">
                <label>Bottom</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.bleedBottom" 
                  @change="updateConfig"
                  min="0"
                  step="0.5"
                />
                <span class="unit">{{ localConfig.unit }}</span>
              </div>
              <div class="input-field">
                <label>Left</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.bleedLeft" 
                  @change="updateConfig"
                  min="0"
                  step="0.5"
                />
                <span class="unit">{{ localConfig.unit }}</span>
              </div>
            </div>
            <p class="help-text">Extra area for printing that will be trimmed</p>
          </div>

          <!-- Binding Type -->
          <div class="setting-group">
            <label class="group-label">Binding Type</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="folded" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <span>Folded (Center Fold)</span>
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  value="flat" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <span>Flat (No Fold)</span>
              </label>
            </div>
          </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useZineStore } from '../stores/zineStore'

const zineStore = useZineStore()
const uniformBleed = ref(true)

// Validation errors
const widthError = ref(false)
const heightError = ref(false)

// Local config that syncs with store
const localConfig = ref({
  width: 0,
  height: 0,
  unit: 'mm',
  margin: 0,
  bleed: 0,
  bleedTop: 0,
  bleedRight: 0,
  bleedBottom: 0,
  bleedLeft: 0,
  bindingType: 'folded'
})

// Validate dimension (max 400mm or 1512px)
const validateDimension = (dimension) => {
  const maxMm = 400
  const maxPx = 1512 // ~400mm at 96 DPI
  const value = localConfig.value[dimension]
  const unit = localConfig.value.unit
  
  const max = unit === 'mm' ? maxMm : maxPx
  
  if (value > max) {
    if (dimension === 'width') {
      widthError.value = true
      localConfig.value.width = max
    } else {
      heightError.value = true
      localConfig.value.height = max
    }
    
    // Clear error after 3 seconds
    setTimeout(() => {
      if (dimension === 'width') widthError.value = false
      else heightError.value = false
    }, 3000)
  } else {
    if (dimension === 'width') widthError.value = false
    else heightError.value = false
  }
}

// Initialize local config from store
const initializeLocalConfig = () => {
  if (zineStore.zineConfig) {
    localConfig.value = {
      width: zineStore.zineConfig.width,
      height: zineStore.zineConfig.height,
      unit: zineStore.zineConfig.unit,
      margin: zineStore.zineConfig.margin || 0,
      bleed: zineStore.zineConfig.bleed || 0,
      bleedTop: zineStore.zineConfig.bleedTop ?? zineStore.zineConfig.bleed ?? 0,
      bleedRight: zineStore.zineConfig.bleedRight ?? zineStore.zineConfig.bleed ?? 0,
      bleedBottom: zineStore.zineConfig.bleedBottom ?? zineStore.zineConfig.bleed ?? 0,
      bleedLeft: zineStore.zineConfig.bleedLeft ?? zineStore.zineConfig.bleed ?? 0,
      bindingType: zineStore.zineConfig.bindingType || 'folded'
    }
    
    // Check if bleeds are uniform
    const { bleedTop, bleedRight, bleedBottom, bleedLeft } = localConfig.value
    uniformBleed.value = bleedTop === bleedRight && bleedRight === bleedBottom && bleedBottom === bleedLeft
  }
}

initializeLocalConfig()

// Watch for store changes
watch(() => zineStore.zineConfig, () => {
  initializeLocalConfig()
}, { deep: true })

// Watch uniformBleed changes
watch(uniformBleed, (newValue) => {
  if (newValue) {
    // Switching to uniform: average the individual values
    const { bleedTop, bleedRight, bleedBottom, bleedLeft } = localConfig.value
    const avg = (bleedTop + bleedRight + bleedBottom + bleedLeft) / 4
    localConfig.value.bleed = Math.round(avg * 10) / 10
  } else {
    // Switching to individual: set all sides to current uniform value
    const uniformValue = localConfig.value.bleed
    localConfig.value.bleedTop = uniformValue
    localConfig.value.bleedRight = uniformValue
    localConfig.value.bleedBottom = uniformValue
    localConfig.value.bleedLeft = uniformValue
  }
  updateConfig()
})

const updateConfig = () => {
  const config = {
    width: localConfig.value.width,
    height: localConfig.value.height,
    unit: localConfig.value.unit,
    margin: localConfig.value.margin,
    bindingType: localConfig.value.bindingType,
    slotInnerMarginPercent: zineStore.zineConfig?.slotInnerMarginPercent ?? 0
  }
  
  if (uniformBleed.value) {
    config.bleed = localConfig.value.bleed
    config.bleedTop = localConfig.value.bleed
    config.bleedRight = localConfig.value.bleed
    config.bleedBottom = localConfig.value.bleed
    config.bleedLeft = localConfig.value.bleed
  } else {
    config.bleed = localConfig.value.bleedTop // Keep for backward compatibility
    config.bleedTop = localConfig.value.bleedTop
    config.bleedRight = localConfig.value.bleedRight
    config.bleedBottom = localConfig.value.bleedBottom
    config.bleedLeft = localConfig.value.bleedLeft
  }
  
  zineStore.zineConfig = config
}
</script>

<style scoped>
.page-settings {
  width: 100%;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
}

.setting-group {
  margin-bottom: 0;
}

.group-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.toggle-uniform {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}

.toggle-uniform input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: var(--accent);
}

.dimension-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.input-field input[type="number"] {
  width: 100%;
  padding: 10px 50px 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  transition: all 0.2s;
}

.input-field input[type="number"]:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field .unit {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  pointer-events: none;
}

.input-field.has-error input[type="number"] {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.input-field.has-error input[type="number"]:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-hint {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 11px;
  color: #ef4444;
  font-weight: 600;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.bleed-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.help-text {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:hover {
  border-color: var(--accent);
  background: var(--muted);
}

.radio-option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent);
}

.radio-option span {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}
</style>
