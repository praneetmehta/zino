<template>
  <div class="order-print-page">
    <!-- Header -->
    <div class="order-header">
      <button class="back-btn" @click="$emit('back')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to Editor
      </button>
      <h1>Order Print</h1>
      <div class="header-actions">
        <button class="btn btn-outline" @click="downloadPDF">
          Download PDF
        </button>
      </div>
    </div>

    <div class="order-content">
      <!-- Left: PDF Flipbook Viewer -->
      <div class="preview-section">
        <div class="section-header">
          <h2>📖 Preview Your Book</h2>
          <p>Flip through your zine as it will be printed</p>
        </div>
        
        <div class="pdf-viewer-container">
          <iframe 
            v-if="pdfUrl" 
            :src="pdfUrl" 
            class="pdf-iframe"
            frameborder="0"
          ></iframe>
          <div v-else class="pdf-loading">
            <div class="spinner"></div>
            <p>Generating PDF preview...</p>
          </div>
        </div>

        <!-- Book Properties -->
        <div class="book-properties">
          <h3>Book Specifications</h3>
          <div class="properties-grid">
            <div class="property-item">
              <span class="property-label">Title</span>
              <span class="property-value">{{ bookTitle }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Pages</span>
              <span class="property-value">{{ pageCount }} pages</span>
            </div>
            <div class="property-item">
              <span class="property-label">Size</span>
              <span class="property-value">{{ bookSize }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Binding</span>
              <span class="property-value">{{ bindingType }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Bleed</span>
              <span class="property-value">{{ bleed }}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Margin</span>
              <span class="property-value">{{ margin }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Print Options & Pricing -->
      <div class="options-section">
        <!-- 3D Preview -->
        <div class="preview-3d-container">
          <h3>📦 How Your Book Will Look</h3>
          <p class="preview-hint">Hover to open the book</p>
          <div class="book-3d-preview" :class="`cover-${selectedCoverType}`">
            <div class="book-3d">
              <div class="book-spine" :style="spineStyle">
                <div class="spine-title">{{ bookTitle }}</div>
              </div>
              <div class="book-front-cover" :style="coverStyle">
                <div class="cover-texture" :style="textureStyle"></div>
                <div class="cover-title">
                  <h4>{{ bookTitle }}</h4>
                  <p class="page-count">{{ pageCount }} pages</p>
                </div>
              </div>
              <div class="book-back-cover" :style="coverStyle"></div>
              <div class="book-pages">
                <!-- First page with preview content -->
                <div class="first-page">
                  <div class="page-content">
                    <div class="preview-slot"></div>
                    <div class="preview-slot"></div>
                    <div class="preview-text-lines">
                      <div class="text-line"></div>
                      <div class="text-line"></div>
                      <div class="text-line"></div>
                    </div>
                  </div>
                </div>
                <!-- Multiple page layers for depth -->
                <div class="page-layer" v-for="i in 8" :key="i" :style="{ transform: `translateZ(${i * 0.3}px)` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cover Type Selection -->
        <div class="option-group">
          <h3>Cover Type</h3>
          <div class="option-cards">
            <div 
              v-for="cover in coverTypes" 
              :key="cover.id"
              class="option-card"
              :class="{ selected: selectedCoverType === cover.id }"
              @click="selectCoverType(cover.id)"
            >
              <div class="option-icon">{{ cover.icon }}</div>
              <div class="option-info">
                <h4>{{ cover.name }}</h4>
                <p>{{ cover.description }}</p>
                <div class="option-price">
                  <span class="price-amount">+€{{ cover.price }}</span>
                </div>
              </div>
              <div class="selected-indicator" v-if="selectedCoverType === cover.id">✓</div>
            </div>
          </div>
        </div>

        <!-- Material Selection (for Hardcover) -->
        <div class="option-group" v-if="selectedCoverType === 'hardcover'">
          <h3>Cover Material</h3>
          <div class="material-tabs">
            <button 
              v-for="mat in materialCategories" 
              :key="mat.id"
              class="material-tab"
              :class="{ active: selectedMaterialCategory === mat.id }"
              @click="selectedMaterialCategory = mat.id"
            >
              {{ mat.name }}
            </button>
          </div>

          <div class="material-grid">
            <div 
              v-for="material in currentMaterials" 
              :key="material.id"
              class="material-card"
              :class="{ selected: selectedMaterial === material.id }"
              @click="selectMaterial(material.id)"
            >
              <div class="material-swatch" :style="material.swatchStyle"></div>
              <div class="material-info">
                <h5>{{ material.name }}</h5>
                <span class="material-price">+€{{ material.price }}</span>
              </div>
              <div class="selected-indicator" v-if="selectedMaterial === material.id">✓</div>
            </div>
          </div>
        </div>

        <!-- Quantity -->
        <div class="option-group">
          <h3>Quantity</h3>
          <div class="quantity-selector">
            <button class="qty-btn" @click="decreaseQuantity" :disabled="quantity <= 1">−</button>
            <input type="number" v-model.number="quantity" min="1" max="1000" />
            <button class="qty-btn" @click="increaseQuantity">+</button>
          </div>
          <p class="quantity-note">Bulk discounts available for 50+ copies</p>
        </div>

        <!-- Price Summary -->
        <div class="price-summary">
          <h3>Order Summary</h3>
          <div class="price-breakdown">
            <div class="price-item">
              <span>Base Price ({{ pageCount }} pages)</span>
              <span class="price-value">€{{ basePrice.toFixed(2) }}</span>
            </div>
            <div class="price-item" v-if="coverPriceAdd > 0">
              <span>{{ selectedCoverName }}</span>
              <span class="price-value price-add">+€{{ coverPriceAdd.toFixed(2) }}</span>
            </div>
            <div class="price-item" v-if="materialPriceAdd > 0">
              <span>{{ selectedMaterialName }}</span>
              <span class="price-value price-add">+€{{ materialPriceAdd.toFixed(2) }}</span>
            </div>
            <div class="price-item quantity-line" v-if="quantity > 1">
              <span>Quantity × {{ quantity }}</span>
              <span class="price-value">{{ quantity }}×</span>
            </div>
            <div class="price-divider"></div>
            <div class="price-item price-total">
              <span>Total</span>
              <span class="price-value total-amount" key="total">
                <span class="price-currency">€</span>
                <transition name="price-change" mode="out-in">
                  <span :key="totalPrice">{{ totalPrice.toFixed(2) }}</span>
                </transition>
              </span>
            </div>
          </div>

          <button class="btn btn-primary btn-order" @click="placeOrder">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 2L4 4M4 4L6 16H16L18 6H4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="8" cy="18" r="1" fill="currentColor"/>
              <circle cx="14" cy="18" r="1" fill="currentColor"/>
            </svg>
            Place Order - €{{ totalPrice.toFixed(2) }}
          </button>
          <p class="order-note">🚚 Estimated delivery: 5-7 business days</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useZineStore } from '../stores/zineStore'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  publication: { type: Object, required: true }
})

const emit = defineEmits(['back'])
const zineStore = useZineStore()
const authStore = useAuthStore()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4876'

// Book info from publication
const bookTitle = computed(() => props.publication?.title || 'Untitled Zine')
const pageCount = computed(() => props.publication?.pageCount || 0)
const bookSize = computed(() => {
  // Try to get from publication metadata, fallback to store
  const cfg = props.publication?.metadata?.config || zineStore.zineConfig
  return cfg ? `${cfg.width} × ${cfg.height} ${cfg.unit}` : 'N/A'
})
const bindingType = computed(() => {
  const cfg = props.publication?.metadata?.config || zineStore.zineConfig
  return cfg?.bindingType === 'folded' ? 'Folded (Center Fold)' : 'Flat (No Fold)'
})
const bleed = computed(() => {
  const cfg = props.publication?.metadata?.config || zineStore.zineConfig
  return cfg ? `${cfg.bleed} ${cfg.unit}` : 'N/A'
})
const margin = computed(() => {
  const cfg = props.publication?.metadata?.config || zineStore.zineConfig
  return cfg ? `${cfg.margin} ${cfg.unit}` : 'N/A'
})

// PDF URL from publication
const pdfUrl = ref(null)

onMounted(() => {
  // Use the direct PDF URL for preview (not the download endpoint)
  if (props.publication?.url) {
    pdfUrl.value = props.publication.url
  }
})

// Cover types
const coverTypes = [
  { id: 'paperback', name: 'Paperback', description: 'Flexible, lightweight cover', icon: '📄', price: 0 },
  { id: 'hardcover', name: 'Hardcover', description: 'Rigid, durable cover', icon: '📕', price: 20 },
]

const selectedCoverType = ref('paperback')
const selectedCoverName = computed(() => {
  return coverTypes.find(c => c.id === selectedCoverType.value)?.name || ''
})

// Material categories (for hardcover)
const materialCategories = [
  { id: 'paper', name: 'Paper' },
  { id: 'cloth-thin', name: 'Thin Cloth' },
  { id: 'cloth-thick', name: 'Book Cloth' },
]

const selectedMaterialCategory = ref('paper')
const selectedMaterial = ref('paper-white')

// Materials database
const materials = {
  paper: [
    { id: 'paper-white', name: 'White', price: 0, swatchStyle: { background: '#ffffff', border: '1px solid #ddd' } },
    { id: 'paper-cream', name: 'Cream', price: 2, swatchStyle: { background: '#FFF8DC' } },
    { id: 'paper-black', name: 'Black', price: 2, swatchStyle: { background: '#1a1a1a' } },
    { id: 'paper-navy', name: 'Navy', price: 2, swatchStyle: { background: '#001f3f' } },
    { id: 'paper-burgundy', name: 'Burgundy', price: 2, swatchStyle: { background: '#6D071A' } },
  ],
  'cloth-thin': [
    { id: 'thin-linen', name: 'Linen', price: 8, swatchStyle: { background: 'linear-gradient(45deg, #E5D3B3 25%, #D4C4A8 25%, #D4C4A8 50%, #E5D3B3 50%, #E5D3B3 75%, #D4C4A8 75%)', backgroundSize: '4px 4px' } },
    { id: 'thin-canvas', name: 'Canvas', price: 8, swatchStyle: { background: '#F5F5DC' } },
    { id: 'thin-cotton-blue', name: 'Cotton Blue', price: 8, swatchStyle: { background: '#4682B4' } },
    { id: 'thin-cotton-green', name: 'Cotton Green', price: 8, swatchStyle: { background: '#2F4F2F' } },
  ],
  'cloth-thick': [
    { id: 'cloth-royal', name: 'Royal Blue', price: 12, swatchStyle: { background: '#0C2340', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' } },
    { id: 'cloth-forest', name: 'Forest Green', price: 12, swatchStyle: { background: '#0B3D0B', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' } },
    { id: 'cloth-burgundy', name: 'Burgundy', price: 12, swatchStyle: { background: '#6D071A', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' } },
    { id: 'cloth-charcoal', name: 'Charcoal', price: 12, swatchStyle: { background: '#36454F', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' } },
  ],
}

const currentMaterials = computed(() => materials[selectedMaterialCategory.value] || [])

const selectedMaterialName = computed(() => {
  const mat = Object.values(materials).flat().find(m => m.id === selectedMaterial.value)
  return mat ? mat.name : ''
})

// Quantity
const quantity = ref(1)

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

// Pricing
const basePrice = computed(() => {
  // Base price: €20 + €1 per page
  return 20 + (pageCount.value * 1)
})

const coverPriceAdd = computed(() => {
  const cover = coverTypes.find(c => c.id === selectedCoverType.value)
  return cover ? cover.price : 0
})

const materialPriceAdd = computed(() => {
  if (selectedCoverType.value !== 'hardcover') return 0
  const mat = Object.values(materials).flat().find(m => m.id === selectedMaterial.value)
  return mat ? mat.price : 0
})

const totalPrice = computed(() => {
  return (basePrice.value + coverPriceAdd.value + materialPriceAdd.value) * quantity.value
})

// Selection handlers
const selectCoverType = (type) => {
  selectedCoverType.value = type
  if (type === 'paperback') {
    selectedMaterial.value = null
  } else {
    // Default to first material in current category
    selectedMaterial.value = currentMaterials.value[0]?.id || 'paper-white'
  }
}

const selectMaterial = (materialId) => {
  selectedMaterial.value = materialId
}

// 3D Preview styles
const coverStyle = computed(() => {
  if (selectedCoverType.value === 'paperback') {
    return { background: '#ffffff', border: '1px solid #ddd' }
  }
  const mat = Object.values(materials).flat().find(m => m.id === selectedMaterial.value)
  return mat?.swatchStyle || { background: '#ffffff', border: '1px solid #ddd' }
})

const spineStyle = computed(() => coverStyle.value)

const textureStyle = computed(() => {
  if (selectedCoverType.value === 'hardcover' && selectedMaterialCategory.value.includes('cloth')) {
    return {
      background: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)',
      mixBlendMode: 'multiply',
    }
  }
  return {}
})

// Actions
const downloadPDF = async () => {
  try {
    const response = await fetch(props.publication.url)
    if (!response.ok) throw new Error('Failed to fetch PDF')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${bookTitle.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    alert('Failed to download PDF')
  }
}

const placeOrder = () => {
  // TODO: Implement order placement
  const order = {
    bookId: zineStore.projectMeta.id,
    title: bookTitle.value,
    coverType: selectedCoverType.value,
    material: selectedMaterial.value,
    quantity: quantity.value,
    total: totalPrice.value,
  }
  console.log('Place order:', order)
  alert('Order feature coming soon! 🎉')
}

// Generate PDF on mount
// TODO: Integrate with PDF generation
</script>

<style scoped>
.order-print-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--border);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--border);
}

.order-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.order-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 500px;
  overflow: hidden;
}

/* Preview Section */
.preview-section {
  padding: 32px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.section-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.pdf-viewer-container {
  width: 100%;
  aspect-ratio: 3/2;
  background: var(--muted);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
  border: 1px solid var(--border);
}

.pdf-iframe {
  width: 100%;
  height: 100%;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.book-properties {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}

.book-properties h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

/* Options Section */
.options-section {
  padding: 32px;
  overflow-y: auto;
  background: var(--panel-bg);
}

.preview-3d-container {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  overflow: visible;
}

.preview-3d-container h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.preview-hint {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 20px 0;
  text-align: center;
}

.book-3d-preview {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
  perspective-origin: 50% 50%;
  overflow: visible;
  padding: 20px;
}

.book-3d {
  width: 160px;
  height: 220px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation: bookFloat 6s ease-in-out infinite;
}

@keyframes bookFloat {
  0%, 100% {
    transform: rotateY(-30deg) rotateX(10deg) translateY(0px);
  }
  50% {
    transform: rotateY(-30deg) rotateX(10deg) translateY(-8px);
  }
}

.book-3d:hover {
  animation-play-state: paused;
  transform: rotateY(-30deg) rotateX(10deg) translateY(-5px) scale(1.08);
}

/* Open book animation on hover */
.book-3d:hover .book-front-cover {
  transform: translateZ(18px) rotateY(-130deg);
  transform-origin: left center;
}

.book-3d:hover .book-pages {
  transform: translateZ(17px) rotateY(-5deg);
}

.book-front-cover,
.book-back-cover,
.book-spine,
.book-pages {
  position: absolute;
  backface-visibility: hidden;
}

.book-front-cover {
  width: 160px;
  height: 220px;
  transform: translateZ(18px);
  transform-origin: left center;
  border-radius: 3px 6px 6px 3px;
  overflow: hidden;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 0 1px rgba(0,0,0,0.15),
    2px 0 8px rgba(0,0,0,0.15),
    4px 0 16px rgba(0,0,0,0.1),
    inset -2px 0 4px rgba(0,0,0,0.1);
}

.book-front-cover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 100%
  );
  pointer-events: none;
}

.book-front-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(0,0,0,0.15),
    transparent
  );
}

.cover-texture {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
}

.cover-title {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  z-index: 10;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.cover-title h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cover-title .page-count {
  font-size: 10px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.book-back-cover {
  width: 160px;
  height: 220px;
  transform: translateZ(-18px) rotateY(180deg);
  border-radius: 6px 3px 3px 6px;
  box-shadow: 
    0 0 0 1px rgba(0,0,0,0.15),
    -2px 0 8px rgba(0,0,0,0.15);
}

.book-spine {
  width: 36px;
  height: 220px;
  left: -18px;
  transform: rotateY(-90deg) translateZ(80px);
  border-radius: 3px;
  background: linear-gradient(
    to right,
    rgba(0,0,0,0.2) 0%,
    rgba(0,0,0,0.05) 10%,
    transparent 20%,
    transparent 80%,
    rgba(0,0,0,0.05) 90%,
    rgba(0,0,0,0.2) 100%
  );
  box-shadow: 
    inset 0 0 8px rgba(0,0,0,0.2),
    -2px 0 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.spine-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 200px;
  padding: 10px 0;
}

.book-pages {
  width: 154px;
  height: 214px;
  left: 3px;
  top: 3px;
  transform: translateZ(17px);
  transform-origin: left center;
  background: linear-gradient(
    to right,
    #f8f8f8 0%,
    #ffffff 5%,
    #ffffff 95%,
    #f0f0f0 100%
  );
  border-radius: 0 3px 3px 0;
  box-shadow: 
    inset -1px 0 2px rgba(0,0,0,0.1),
    inset 0 0 20px rgba(0,0,0,0.03);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-pages::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 10px,
    rgba(0,0,0,0.02) 10px,
    rgba(0,0,0,0.02) 11px
  );
  pointer-events: none;
}

/* First page content */
.first-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.5s ease 0.3s;
}

.book-3d:hover .first-page {
  opacity: 1;
}

.page-content {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.preview-slot {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.preview-slot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.preview-text-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.text-line {
  height: 3px;
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
}

.text-line:nth-child(1) { width: 90%; }
.text-line:nth-child(2) { width: 85%; }
.text-line:nth-child(3) { width: 70%; }

/* Individual page layers */
.page-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid rgba(0,0,0,0.05);
  box-shadow: 1px 0 2px rgba(0,0,0,0.05);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-3d:hover .page-layer:nth-child(1) { transform: translateZ(0.3px) rotateY(-2deg) !important; }
.book-3d:hover .page-layer:nth-child(2) { transform: translateZ(0.6px) rotateY(-4deg) !important; }
.book-3d:hover .page-layer:nth-child(3) { transform: translateZ(0.9px) rotateY(-6deg) !important; }
.book-3d:hover .page-layer:nth-child(4) { transform: translateZ(1.2px) rotateY(-8deg) !important; }
.book-3d:hover .page-layer:nth-child(5) { transform: translateZ(1.5px) rotateY(-10deg) !important; }
.book-3d:hover .page-layer:nth-child(6) { transform: translateZ(1.8px) rotateY(-12deg) !important; }
.book-3d:hover .page-layer:nth-child(7) { transform: translateZ(2.1px) rotateY(-14deg) !important; }
.book-3d:hover .page-layer:nth-child(8) { transform: translateZ(2.4px) rotateY(-16deg) !important; }

/* Hardcover specific styling */
.cover-hardcover .book-front-cover,
.cover-hardcover .book-back-cover {
  box-shadow: 
    0 0 0 2px rgba(0,0,0,0.2),
    2px 0 12px rgba(0,0,0,0.2),
    4px 0 20px rgba(0,0,0,0.15),
    inset -2px 0 6px rgba(0,0,0,0.15);
}

.cover-hardcover .book-spine {
  box-shadow: 
    inset 0 0 12px rgba(0,0,0,0.3),
    -3px 0 6px rgba(0,0,0,0.15);
}

/* Option Groups */
.option-group {
  margin-bottom: 32px;
}

.option-group h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.option-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.option-card:hover {
  border-color: var(--accent);
  transform: translateX(4px);
}

.option-card.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
}

.option-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
}

.option-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.option-info p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.option-price {
  margin-top: 8px;
}

.price-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.selected-indicator {
  width: 24px;
  height: 24px;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

/* Material Selection */
.material-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.material-tab {
  padding: 8px 16px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.material-tab:hover {
  background: var(--border);
}

.material-tab.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.material-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.material-card {
  padding: 12px;
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.material-card:hover {
  border-color: var(--accent);
}

.material-card.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg));
}

.material-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}

.material-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.material-info h5 {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.material-price {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

/* Quantity Selector */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: var(--border);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 80px;
  padding: 10px;
  text-align: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
}

.quantity-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

/* Price Summary */
.price-summary {
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  position: sticky;
  top: 0;
}

.price-summary h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.price-value {
  font-weight: 600;
  color: var(--text);
}

.price-add {
  color: var(--accent);
}

.price-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.price-total {
  font-size: 18px;
  font-weight: 700;
}

.total-amount {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: var(--accent);
}

.price-currency {
  font-size: 16px;
}

.price-change-enter-active,
.price-change-leave-active {
  transition: all 0.3s ease;
}

.price-change-enter-from {
  transform: translateY(-10px) scale(0.9);
  opacity: 0;
}

.price-change-leave-to {
  transform: translateY(10px) scale(0.9);
  opacity: 0;
}

.btn-order {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-order:hover {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.order-note {
  margin: 12px 0 0 0;
  font-size: 12px;
  text-align: center;
  color: var(--text-muted);
}
</style>
