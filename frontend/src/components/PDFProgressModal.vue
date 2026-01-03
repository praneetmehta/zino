<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="progress-overlay">
        <div class="progress-modal">
          <div class="progress-header">
            <div class="progress-icon" :class="{ 'success': isComplete }">
              <svg v-if="!isComplete" class="spinner-large" width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="4" stroke-dasharray="60 40" opacity="0.3"/>
              </svg>
              <svg v-else width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--accent)" opacity="0.2"/>
                <path d="M14 24L20 30L34 16" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <h3>{{ isComplete ? completeTitle : title }}</h3>
            <p class="progress-subtitle">{{ currentStep }}</p>
          </div>

          <div class="progress-content">
            <!-- Progress Bar -->
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div 
                  class="progress-bar-fill" 
                  :style="{ width: `${progress}%` }"
                ></div>
              </div>
              <div class="progress-text">{{ progress }}%</div>
            </div>

            <!-- Steps List -->
            <div class="steps-list">
              <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="step-item"
                :class="{
                  'active': !isComplete && index === currentStepIndex,
                  'completed': isComplete || index < currentStepIndex,
                }"
              >
                <div class="step-icon">
                  <svg v-if="isComplete || index < currentStepIndex" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-else-if="!isComplete && index === currentStepIndex" class="step-spinner"></div>
                  <div v-else class="step-dot"></div>
                </div>
                <div class="step-text">
                  <div class="step-label">{{ step.label }}</div>
                  <div v-if="step.detail && index === currentStepIndex" class="step-detail">{{ step.detail }}</div>
                </div>
              </div>
            </div>

            <!-- File Info -->
            <div v-if="fileSize" class="file-info">
              <div class="info-item">
                <span class="info-label">Pages:</span>
                <span class="info-value">{{ pageCount }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">{{ formatFileSize(fileSize) }}</span>
              </div>
            </div>

            <!-- Waiting for download dialog -->
            <div v-if="isComplete && !downloadStarted" class="download-waiting">
              <div class="waiting-icon">⏳</div>
              <div class="waiting-text">Waiting for system download dialog...</div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="isComplete" class="progress-actions">
            <button class="btn btn-outline" @click="$emit('close')">
              Close
            </button>
            <button v-if="onViewPublished" class="btn btn-primary" @click="handleViewPublished">
              View Published PDFs
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Generating PDF' },
  completeTitle: { type: String, default: 'PDF Ready!' },
  onViewPublished: { type: Function, default: null }
})

const emit = defineEmits(['close'])

const currentStepIndex = ref(0)
const progress = ref(0)
const currentStep = ref('')
const steps = ref([])
const isComplete = ref(false)
const fileSize = ref(0)
const pageCount = ref(0)
const downloadStarted = ref(false)

function setSteps(newSteps) {
  steps.value = newSteps
  currentStepIndex.value = 0
  progress.value = 0
  isComplete.value = false
  if (newSteps.length > 0) {
    currentStep.value = newSteps[0].label
  }
}

function updateProgress(stepIndex, stepProgress = 100) {
  currentStepIndex.value = stepIndex
  if (steps.value[stepIndex]) {
    currentStep.value = steps.value[stepIndex].label
  }
  
  // Calculate overall progress
  const stepWeight = 100 / steps.value.length
  const baseProgress = stepIndex * stepWeight
  const stepContribution = (stepProgress / 100) * stepWeight
  progress.value = Math.min(Math.round(baseProgress + stepContribution), 100)
}

function complete(size = 0, pages = 0) {
  isComplete.value = true
  progress.value = 100
  currentStep.value = 'Complete!'
  currentStepIndex.value = steps.value.length // Move past all steps
  fileSize.value = size
  pageCount.value = pages
  downloadStarted.value = false
  
  // Auto-hide the waiting message after 3 seconds
  setTimeout(() => {
    downloadStarted.value = true
  }, 3000)
}

function reset() {
  currentStepIndex.value = 0
  progress.value = 0
  isComplete.value = false
  currentStep.value = ''
  steps.value = []
  fileSize.value = 0
  pageCount.value = 0
  downloadStarted.value = false
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleViewPublished() {
  if (props.onViewPublished) {
    props.onViewPublished()
  }
  emit('close')
}

defineExpose({
  setSteps,
  updateProgress,
  complete,
  reset
})
</script>

<style scoped>
.progress-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 24px;
}

.progress-modal {
  background: var(--panel-bg);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border);
  animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.progress-header {
  text-align: center;
  margin-bottom: 32px;
}

.progress-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.progress-icon.success {
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.spinner-large {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-header h3 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.progress-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.progress-content {
  margin-bottom: 24px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--muted);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 80%, purple));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  min-width: 45px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--muted);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.step-item.active {
  background: color-mix(in srgb, var(--accent) 10%, var(--muted));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
}

.step-item.completed {
  opacity: 0.6;
}

.step-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
}

.step-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.step-text {
  flex: 1;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}

.step-detail {
  font-size: 12px;
  color: var(--text-muted);
}

.file-info {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--muted);
  border-radius: 10px;
  margin-bottom: 8px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 13px;
  color: var(--text-muted);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.download-waiting {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: color-mix(in srgb, var(--accent) 8%, var(--muted));
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px;
  margin-top: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.waiting-icon {
  font-size: 20px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.waiting-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.progress-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.progress-actions .btn {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
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
