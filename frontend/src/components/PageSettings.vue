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

          <!-- Binding Type with Visual Previews -->
          <div class="setting-group binding-section">
            <label class="group-label">Binding & Fold Type</label>
            <p class="section-description">
              Choose how your zine will be assembled. This affects page arrangement and folding.
            </p>
            
            <div class="binding-options">
              <!-- Saddle Stitch (Folded) -->
              <label class="binding-card" :class="{ active: localConfig.bindingType === 'folded' }">
                <input 
                  type="radio" 
                  value="folded" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <div class="card-visual">
                  <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Folded zine representation -->
                    <rect x="20" y="15" width="25" height="50" fill="var(--muted)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                    <rect x="45" y="15" width="25" height="50" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                    <line x1="45" y1="15" x2="45" y2="65" stroke="var(--accent)" stroke-width="3" stroke-dasharray="4,2"/>
                    <circle cx="45" cy="30" r="2" fill="var(--accent)"/>
                    <circle cx="45" cy="50" r="2" fill="var(--accent)"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4>Saddle Stitch</h4>
                  <p class="binding-desc">Classic center-folded zine with staples along the spine</p>
                  <ul class="binding-features">
                    <li>✓ Traditional zine style</li>
                    <li>✓ Easy to print & fold</li>
                    <li>✓ 4-32 pages typical</li>
                  </ul>
                </div>
              </label>

              <!-- Flat / Single Pages -->
              <label class="binding-card" :class="{ active: localConfig.bindingType === 'flat' }">
                <input 
                  type="radio" 
                  value="flat" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <div class="card-visual">
                  <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Flat pages representation -->
                    <rect x="15" y="20" width="30" height="40" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                    <rect x="25" y="25" width="30" height="40" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                    <rect x="35" y="30" width="30" height="40" fill="var(--muted)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4>Flat Pages</h4>
                  <p class="binding-desc">Separate pages without folding - print one-sided or two-sided</p>
                  <ul class="binding-features">
                    <li>✓ Simple layout</li>
                    <li>✓ Any page count</li>
                    <li>✓ Great for digital</li>
                  </ul>
                </div>
              </label>

              <!-- Side Stitch / Japanese Binding -->
              <label class="binding-card" :class="{ active: localConfig.bindingType === 'side-stitch' }">
                <input 
                  type="radio" 
                  value="side-stitch" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <div class="card-visual">
                  <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Side stitch representation -->
                    <rect x="30" y="15" width="40" height="50" fill="var(--bg)" stroke="var(--accent)" stroke-width="2" rx="2"/>
                    <circle cx="35" cy="25" r="2" fill="var(--accent)"/>
                    <circle cx="35" cy="40" r="2" fill="var(--accent)"/>
                    <circle cx="35" cy="55" r="2" fill="var(--accent)"/>
                    <line x1="35" y1="25" x2="35" y2="55" stroke="var(--accent)" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4>Side Stitch</h4>
                  <p class="binding-desc">Pages bound along the left edge, Japanese-style binding</p>
                  <ul class="binding-features">
                    <li>✓ Artistic look</li>
                    <li>✓ Layflat design</li>
                    <li>✓ Flexible page count</li>
                  </ul>
                </div>
              </label>

              <!-- Accordion Fold -->
              <label class="binding-card" :class="{ active: localConfig.bindingType === 'accordion' }">
                <input 
                  type="radio" 
                  value="accordion" 
                  v-model="localConfig.bindingType"
                  @change="updateConfig"
                />
                <div class="card-visual">
                  <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
                    <!-- Accordion fold representation -->
                    <path d="M 20,20 L 30,20 L 30,60 L 20,60 Z" fill="var(--muted)" stroke="var(--accent)" stroke-width="2"/>
                    <path d="M 30,20 L 40,15 L 40,55 L 30,60 Z" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>
                    <path d="M 40,15 L 50,20 L 50,60 L 40,55 Z" fill="var(--muted)" stroke="var(--accent)" stroke-width="2"/>
                    <path d="M 50,20 L 60,15 L 60,55 L 50,60 Z" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>
                    <path d="M 60,15 L 70,20 L 70,60 L 60,55 Z" fill="var(--muted)" stroke="var(--accent)" stroke-width="2"/>
                  </svg>
                </div>
                <div class="card-content">
                  <h4>Accordion Fold</h4>
                  <p class="binding-desc">Zigzag folding creates a continuous display when unfolded</p>
                  <ul class="binding-features">
                    <li>✓ Unique presentation</li>
                    <li>✓ Can display fully open</li>
                    <li>✓ 6-12 panels typical</li>
                  </ul>
                </div>
              </label>
            </div>

            <!-- Live Preview of Selected Type -->
            <div class="binding-preview">
              <h5>How it looks:</h5>
              <div class="preview-container">
                <div class="preview-zine" :class="`preview-${localConfig.bindingType}`">
                  <div v-if="localConfig.bindingType === 'folded'" class="preview-folded">
                    <div class="preview-page left">Cover</div>
                    <div class="preview-fold-line"></div>
                    <div class="preview-page right">Back</div>
                  </div>
                  <div v-else-if="localConfig.bindingType === 'flat'" class="preview-flat">
                    <div class="preview-page">Page 1</div>
                    <div class="preview-page">Page 2</div>
                    <div class="preview-page">Page 3</div>
                  </div>
                  <div v-else-if="localConfig.bindingType === 'side-stitch'" class="preview-side">
                    <div class="preview-page-stack">
                      <div class="preview-binding-holes">
                        <div class="hole"></div>
                        <div class="hole"></div>
                        <div class="hole"></div>
                      </div>
                      <div class="preview-page">Cover</div>
                    </div>
                  </div>
                  <div v-else-if="localConfig.bindingType === 'accordion'" class="preview-accordion">
                    <div class="panel">1</div>
                    <div class="panel fold-out">2</div>
                    <div class="panel">3</div>
                    <div class="panel fold-out">4</div>
                    <div class="panel">5</div>
                  </div>
                </div>
                <p class="preview-label">{{ getBindingDescription(localConfig.bindingType) }}</p>
              </div>
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

const getBindingDescription = (type) => {
  const descriptions = {
    folded: 'Pages are arranged for center-fold printing. Print double-sided, fold in half, and staple.',
    flat: 'Each page is independent. Print and assemble as single sheets or in a binder.',
    'side-stitch': 'Pages stack together and bind along the left edge with thread or staples.',
    accordion: 'One continuous sheet folded in a zigzag pattern. Unfolds into a long display.'
  }
  return descriptions[type] || descriptions.folded
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

/* Binding Section */
.binding-section {
  grid-column: 1 / -1;
}

.section-description {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  line-height: 1.5;
}

.binding-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.binding-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.binding-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.binding-card.active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.binding-card input[type="radio"] {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent);
}

.card-visual {
  width: 100%;
  height: 100px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel-bg);
  border-radius: 8px;
  padding: 12px;
}

.card-visual svg {
  width: 100%;
  height: 100%;
}

.card-content h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.binding-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 12px;
}

.binding-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.binding-features li {
  font-size: 11px;
  color: var(--text-muted);
  padding-left: 4px;
}

/* Live Preview */
.binding-preview {
  background: var(--panel-bg);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border);
}

.binding-preview h5 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.preview-zine {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Folded Preview */
.preview-folded {
  display: flex;
  align-items: center;
  gap: 0;
}

.preview-page {
  width: 80px;
  height: 120px;
  background: var(--bg);
  border: 2px solid var(--accent);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.preview-page.left {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.preview-page.right {
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.preview-fold-line {
  width: 3px;
  height: 120px;
  background: var(--accent);
  position: relative;
}

.preview-fold-line::before,
.preview-fold-line::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
}

.preview-fold-line::before {
  top: 30px;
}

.preview-fold-line::after {
  bottom: 30px;
}

/* Flat Preview */
.preview-flat {
  display: flex;
  gap: 12px;
}

.preview-flat .preview-page {
  width: 70px;
  height: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-flat .preview-page:nth-child(2) {
  transform: translateY(8px);
}

.preview-flat .preview-page:nth-child(3) {
  transform: translateY(16px);
}

/* Side Stitch Preview */
.preview-side {
  position: relative;
}

.preview-page-stack {
  position: relative;
  width: 100px;
  height: 140px;
}

.preview-page-stack .preview-page {
  width: 100%;
  height: 100%;
}

.preview-binding-holes {
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  z-index: 10;
}

.preview-binding-holes .hole {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--bg);
}

/* Accordion Preview */
.preview-accordion {
  display: flex;
  align-items: center;
  gap: 0;
}

.panel {
  width: 40px;
  height: 100px;
  background: var(--bg);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel.fold-out {
  transform: rotateY(20deg);
  background: var(--muted);
}

.panel:nth-child(odd) {
  border-right: none;
}

.panel:nth-child(even) {
  border-left: none;
}

.preview-label {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 400px;
}
</style>
