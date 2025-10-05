<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Create New Zine</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Page Dimensions</label>
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
        </div>

        <div class="form-group">
          <label>Bleed ({{ config.unit }})</label>
          <input
            v-model.number="config.bleed"
            type="number"
            placeholder="0"
            min="0"
          />
          <small>Extra space around the page for printing</small>
        </div>

        <div class="form-group">
          <label>Margin ({{ config.unit }})</label>
          <input
            v-model.number="config.margin"
            type="number"
            placeholder="0"
            min="0"
          />
          <small>Inner margin from page edges</small>
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

        <div class="preset-buttons">
          <button type="button" class="btn btn-outline" @click="applyPreset('postcard')">
            Postcard (148×100mm)
          </button>
          <button type="button" class="btn btn-outline" @click="applyPreset('a4')">
            A4 (210×297mm)
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

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Create Zine</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['initialize'])

const config = reactive({
  width: 148,
  height: 100,
  unit: 'mm',
  bleed: 3,
  margin: 10,
  slotInnerMarginPercent: 0,
})

const presets = {
  postcard: { width: 148, height: 100, unit: 'mm' },
  a4: { width: 210, height: 297, unit: 'mm' },
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
  margin-bottom: 32px;
  color: var(--text-strong);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
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

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 28px;
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
</style>
