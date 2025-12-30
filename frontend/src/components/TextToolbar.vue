<template>
  <div v-if="isVisible" class="text-toolbar" :style="toolbarPosition" @click.stop>
    <div class="toolbar-section">
      <label class="toolbar-label">Font</label>
      <select v-model="localStyle.fontFamily" @input="updateStyle" class="toolbar-select font-select">
        <optgroup label="Sans Serif">
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Raleway">Raleway</option>
          <option value="Work Sans">Work Sans</option>
          <option value="DM Sans">DM Sans</option>
          <option value="Space Grotesk">Space Grotesk</option>
        </optgroup>
        <optgroup label="Serif">
          <option value="Playfair Display">Playfair Display</option>
          <option value="Lora">Lora</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Crimson Text">Crimson Text</option>
          <option value="Libre Baskerville">Libre Baskerville</option>
        </optgroup>
        <optgroup label="Display">
          <option value="Bebas Neue">Bebas Neue</option>
          <option value="Oswald">Oswald</option>
        </optgroup>
        <optgroup label="System">
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
        </optgroup>
      </select>
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label">Size</label>
      <input 
        type="number" 
        v-model.number="localStyle.fontSize" 
        @input="updateStyle"
        min="8" 
        max="200" 
        class="toolbar-input"
      />
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label">Weight</label>
      <select v-model.number="localStyle.fontWeight" @input="updateStyle" class="toolbar-select">
        <option :value="300">Light</option>
        <option :value="400">Regular</option>
        <option :value="500">Medium</option>
        <option :value="600">Semibold</option>
        <option :value="700">Bold</option>
        <option :value="900">Black</option>
      </select>
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label">Align</label>
      <div class="button-group">
        <button 
          @click="setAlign('left')" 
          :class="{ active: localStyle.textAlign === 'left' }"
          class="icon-btn"
          title="Left"
        >⬅️</button>
        <button 
          @click="setAlign('center')" 
          :class="{ active: localStyle.textAlign === 'center' }"
          class="icon-btn"
          title="Center"
        >↔️</button>
        <button 
          @click="setAlign('right')" 
          :class="{ active: localStyle.textAlign === 'right' }"
          class="icon-btn"
          title="Right"
        >➡️</button>
      </div>
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label">Color</label>
      <input 
        type="color" 
        v-model="localStyle.color" 
        @input="updateStyle"
        class="color-input"
      />
    </div>

    <div class="toolbar-section">
      <label class="toolbar-label">Background</label>
      <input 
        type="color" 
        v-model="localStyle.backgroundColor" 
        @input="updateStyle"
        class="color-input"
      />
      <button 
        @click="clearBackground" 
        class="icon-btn"
        title="Transparent"
      >🚫</button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <label class="toolbar-label">Layer</label>
      <div class="layer-button-group">
        <button 
          @click="$emit('bring-to-front')" 
          class="layer-btn-minimal"
          title="Bring to Front"
        >↑</button>
        <button 
          @click="$emit('send-to-back')" 
          class="layer-btn-minimal"
          title="Send to Back"
        >↓</button>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <label class="toolbar-label">Presets</label>
      <div class="preset-buttons">
        <button @click="applyPreset('editorial-hero')" class="preset-btn">Editorial Hero</button>
        <button @click="applyPreset('bold-number')" class="preset-btn">Bold Number</button>
        <button @click="applyPreset('magazine-title')" class="preset-btn">Magazine</button>
        <button @click="applyPreset('impact-statement')" class="preset-btn">Impact</button>
        <button @click="applyPreset('heading')" class="preset-btn">Heading</button>
        <button @click="applyPreset('body')" class="preset-btn">Body</button>
        <button @click="applyPreset('minimal-caption')" class="preset-btn">Caption</button>
        <button @click="applyPreset('sidebar-label')" class="preset-btn">Label</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  textStyle: Object,
  position: Object,
})

const emit = defineEmits(['update:textStyle', 'applyPreset', 'bring-to-front', 'send-to-back'])

const localStyle = ref({ ...props.textStyle })

watch(() => props.textStyle, (newStyle) => {
  if (newStyle && Object.keys(newStyle).length > 0) {
    localStyle.value = { ...newStyle }
  }
}, { deep: true, immediate: true })

const toolbarPosition = computed(() => {
  if (!props.position) return {}
  return {
    top: `${props.position.top}px`,
    left: `${props.position.left}px`,
  }
})

const updateStyle = () => {
  // Ensure fontWeight is a number
  if (localStyle.value.fontWeight) {
    localStyle.value.fontWeight = Number(localStyle.value.fontWeight)
  }
  emit('update:textStyle', { ...localStyle.value })
}

const setAlign = (align) => {
  localStyle.value.textAlign = align
  updateStyle()
}

const clearBackground = () => {
  localStyle.value.backgroundColor = 'transparent'
  updateStyle()
}

const applyPreset = (preset) => {
  emit('applyPreset', preset)
}
</script>

<style scoped>
.text-toolbar {
  position: fixed;
  background: var(--panel-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturation);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturation);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-xl), inset 0 1px 0 rgba(255,255,255,0.2);
  z-index: 1000;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 900px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toolbar-select,
.toolbar-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel-bg-solid);
  color: var(--text);
  font-size: 13px;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.toolbar-select:focus,
.toolbar-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), var(--shadow-sm);
}

.toolbar-input {
  width: 70px;
}

.font-select {
  min-width: 180px;
}

.button-group {
  display: flex;
  gap: 4px;
}

.layer-button-group {
  display: flex;
  gap: 6px;
}

.layer-btn-minimal {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  color: #1a1d23;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.layer-btn-minimal:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.layer-btn-minimal:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.icon-btn {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--muted);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  transform: scale(1.05);
}

.icon-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.color-input {
  width: 50px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  background: var(--muted);
}

.toolbar-divider {
  width: 1px;
  background: var(--border);
  margin: 0 8px;
}

.preset-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--muted);
  color: var(--text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.preset-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: translateY(-2px);
}
</style>
