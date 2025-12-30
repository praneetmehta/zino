<template>
  <div class="lazy-image" :class="{ loaded: isLoaded }">
    <!-- Blurred thumbnail (loads immediately) -->
    <img
      v-if="thumbnailUrl"
      :src="thumbnailUrl"
      class="lazy-image-placeholder"
      :class="{ hidden: isLoaded }"
      :alt="alt"
    />
    
    <!-- Full resolution image (loads lazily) -->
    <img
      ref="imageRef"
      :src="src"
      class="lazy-image-full"
      :class="{ visible: isLoaded }"
      :alt="alt"
      :style="style"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />
    
    <!-- Loading indicator (optional) -->
    <div v-if="!isLoaded && !error" class="lazy-image-loading">
      <div class="spinner"></div>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="lazy-image-error">
      <span>⚠️ Failed to load</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: ''
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const imageRef = ref(null)
const isLoaded = ref(false)
const error = ref(false)

const handleLoad = () => {
  isLoaded.value = true
  error.value = false
}

const handleError = () => {
  error.value = true
  console.error('Failed to load image:', props.src)
}

// Reset when src changes
watch(() => props.src, () => {
  isLoaded.value = false
  error.value = false
})

// If no thumbnail, start loading immediately
onMounted(() => {
  if (!props.thumbnailUrl && imageRef.value?.complete) {
    isLoaded.value = true
  }
})
</script>

<style scoped>
.lazy-image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--muted, #f0f0f0);
}

/* Blurred thumbnail placeholder */
.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: inherit;
  filter: blur(20px);
  transform: scale(1.1); /* Prevent blur edge artifacts */
  transition: opacity 0.3s ease;
  opacity: 1;
}

.lazy-image-placeholder.hidden {
  opacity: 0;
  pointer-events: none;
}

/* Full resolution image */
.lazy-image-full {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image-full.visible {
  opacity: 1;
}

/* Loading indicator */
.lazy-image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.lazy-image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  z-index: 10;
}

/* Loaded state */
.lazy-image.loaded .lazy-image-placeholder {
  opacity: 0;
}
</style>
