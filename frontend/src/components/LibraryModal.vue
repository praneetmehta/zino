<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2>📚 Your Library</h2>
          <button class="btn-templates" @click="$emit('open-templates')" title="Browse Templates">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Templates
          </button>
          <button class="close-btn" @click="close">✕</button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading your books...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button class="btn btn-outline" @click="fetchBooks">Try Again</button>
          </div>

          <!-- Empty State -->
          <div v-else-if="books.length === 0" class="empty-state">
            <span class="empty-icon">📭</span>
            <h3>No books yet</h3>
            <p>Your saved books will appear here. Start by creating a new book and saving it to your library.</p>
            <button class="btn btn-primary" @click="$emit('create-new')">Create Your First Book</button>
          </div>

          <!-- Books Grid -->
          <div v-else class="books-grid">
            <div
              v-for="book in books"
              :key="book.id"
              class="book-card"
              :class="{ selected: selectedBook?.id === book.id }"
              @click="selectBook(book)"
              @dblclick="loadBook(book)"
            >
              <div class="book-thumbnail" :style="book.thumbnail ? { backgroundImage: `url(${book.thumbnail})` } : {}">
                <span v-if="!book.thumbnail" class="book-icon">📖</span>
                <div class="book-badge" v-if="isRecent(book)">Recent</div>
              </div>
              <div class="book-info">
                <h4 class="book-title">{{ book.title || 'Untitled' }}</h4>
                <p class="book-id">{{ book.id }}</p>
                <div class="book-meta">
                  <span class="meta-item">
                    <span class="meta-icon">🕐</span>
                    {{ formatDate(book.updatedAt) }}
                  </span>
                </div>
              </div>
              <div class="book-actions">
                <button
                  class="action-btn delete-btn"
                  @click.stop="confirmDelete(book)"
                  title="Delete book"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" v-if="books.length > 0">
          <div class="footer-info">
            <span v-if="selectedBook">Selected: <strong>{{ selectedBook.title || selectedBook.id }}</strong></span>
            <span v-else>{{ books.length }} book{{ books.length === 1 ? '' : 's' }} in library</span>
          </div>
          <div class="footer-actions">
            <button class="btn btn-outline" @click="close">Cancel</button>
            <button
              class="btn btn-primary"
              :disabled="!selectedBook || loadingBook"
              @click="loadSelectedBook"
            >
              <span v-if="loadingBook">Loading...</span>
              <span v-else>Open Book</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { listBooks, getBook, deleteBook } from '../api/books'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'load-book', 'create-new'])

const books = ref([])
const selectedBook = ref(null)
const loading = ref(false)
const loadingBook = ref(false)
const error = ref(null)

const fetchBooks = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await listBooks()
    books.value = data
  } catch (err) {
    console.error('Failed to fetch books:', err)
    error.value = err.message || 'Failed to load books from library'
  } finally {
    loading.value = false
  }
}

const selectBook = (book) => {
  selectedBook.value = book
}

const loadBook = async (book) => {
  loadingBook.value = true
  try {
    const fullBook = await getBook(book.id)
    emit('load-book', fullBook)
    close()
  } catch (err) {
    console.error('Failed to load book:', err)
    error.value = `Failed to load "${book.title || book.id}": ${err.message}`
  } finally {
    loadingBook.value = false
  }
}

const loadSelectedBook = () => {
  if (selectedBook.value) {
    loadBook(selectedBook.value)
  }
}

const confirmDelete = async (book) => {
  if (!confirm(`Delete "${book.title || book.id}"? This cannot be undone.`)) {
    return
  }

  try {
    await deleteBook(book.id)
    books.value = books.value.filter(b => b.id !== book.id)
    if (selectedBook.value?.id === book.id) {
      selectedBook.value = null
    }
  } catch (err) {
    console.error('Failed to delete book:', err)
    alert(`Failed to delete book: ${err.message}`)
  }
}

const formatDate = (isoString) => {
  if (!isoString) return 'Never saved'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  
  return date.toLocaleDateString()
}

const isRecent = (book) => {
  if (!book.updatedAt) return false
  const diffMs = Date.now() - new Date(book.updatedAt).getTime()
  return diffMs < 24 * 60 * 60 * 1000 // Less than 24 hours
}

const close = () => {
  selectedBook.value = null
  error.value = null
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchBooks()
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: var(--panel-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border);
  overflow: hidden;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-strong);
  margin: 0;
  flex: 1;
}

.btn-templates {
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-templates:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-templates svg {
  flex-shrink: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--muted);
  color: var(--text);
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
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  color: var(--text-muted);
  font-size: 15px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state p {
  color: var(--danger);
  margin-bottom: 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: var(--text);
}

.empty-state p {
  color: var(--text-muted);
  max-width: 400px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.book-card {
  background: var(--panel-bg-solid);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.book-card.selected {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, var(--panel-bg-solid));
}

.book-thumbnail {
  width: 100%;
  aspect-ratio: 3/2;
  background: var(--muted);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}

.book-icon {
  font-size: 48px;
  opacity: 0.6;
}

.book-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--accent);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.book-info {
  margin-bottom: 12px;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-strong);
  margin: 0 0 6px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-id {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 10px 0;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-icon {
  font-size: 14px;
}

.book-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-bg);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.action-btn:hover {
  transform: scale(1.1);
}

.delete-btn:hover {
  background: var(--danger);
  border-color: var(--danger);
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.footer-info {
  font-size: 14px;
  color: var(--text-muted);
}

.footer-info strong {
  color: var(--text);
}

.footer-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions .btn {
    flex: 1;
  }
}
</style>
