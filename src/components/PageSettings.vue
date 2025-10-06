<template>
  <div class="page-settings">
    <!-- Page Dimensions -->
    <div class="setting-group">
            <label class="group-label">Page Dimensions</label>
            <div class="dimension-row">
              <div class="input-field">
                <label>Width</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.width" 
                  @change="updateConfig"
                  min="10"
                  step="1"
                />
                <span class="unit">{{ localConfig.unit }}</span>
              </div>
              <div class="input-field">
                <label>Height</label>
                <input 
                  type="number" 
                  v-model.number="localConfig.height" 
                  @change="updateConfig"
                  min="10"
                  step="1"
                />
                <span class="unit">{{ localConfig.unit }}</span>
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
            <p class="help-text">Content should stay within this margin</p>
          </div>

          <!-- Bleed -->
          <div class="setting-group">
            <div class="group-header">
              <label class="group-label">Bleed (Print Extension)</label>
              <label class="toggle-uniform">
                <input type="checkbox" v-model="uniformBleed" @change="handleUniformBleedToggle" />
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

const handleUniformBleedToggle = () => {
  if (uniformBleed.value) {
    // Set all sides to the average or the first non-zero value
    const avg = (localConfig.value.bleedTop + localConfig.value.bleedRight + 
                 localConfig.value.bleedBottom + localConfig.value.bleedLeft) / 4
    localConfig.value.bleed = Math.round(avg * 10) / 10
  } else {
    // Initialize individual bleeds from uniform value
    localConfig.value.bleedTop = localConfig.value.bleed
    localConfig.value.bleedRight = localConfig.value.bleed
    localConfig.value.bleedBottom = localConfig.value.bleed
    localConfig.value.bleedLeft = localConfig.value.bleed
  }
  updateConfig()
}

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
