<template>
  <div class="landing" :class="`theme-${theme}`">
    <div class="background"></div>
    <header class="landing-header">
      <div class="brand">
        <span class="logo">📚</span>
        <div class="title">
          <h1>Zino Studio</h1>
          <p>Create bold, expressive publications in minutes.</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-outline" @click="toggleTheme">
          <span v-if="theme === 'light'">🌙</span>
          <span v-else>☀️</span>
          <span class="label">{{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
      </div>
    </header>

    <main class="landing-content">
      <section class="hero">
        <div class="hero-text">
          <h2>Design the stories you want to tell.</h2>
          <p>
            Craft zines, postcards, and editorial spreads with a canvas that celebrates experimentation.
            Start fresh, remix your library, or fine-tune layouts in the builder.
          </p>
          <div class="hero-cta">
            <button class="btn btn-primary" @click="$emit('create-new')">Create a Book</button>
            <button class="btn btn-ghost" :disabled="loading" @click="$emit('load-book')">
              <span v-if="loading">🔍 Loading…</span>
              <span v-else>📂 Open from Library</span>
            </button>
          </div>
          <div class="meta" v-if="lastSavedSummary">
            <span>Last saved project:</span>
            <strong>{{ lastSavedSummary }}</strong>
          </div>
        </div>
        <div class="hero-preview">
          <div class="preview-card" v-for="card in previewLayouts" :key="card.id">
            <div class="preview-thumb" :style="{ backgroundImage: `url(${card.image})` }"></div>
            <div class="preview-info">
              <span class="preview-name">{{ card.name }}</span>
              <span class="preview-tag">{{ card.tag }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="grid">
        <article class="card" @click="$emit('create-new')">
          <div class="card-icon">🪄</div>
          <h3>Blank Canvas</h3>
          <p>Start a new book with postcard presets, guides, and curated layouts ready to drop into place.</p>
          <span class="card-link">Create now →</span>
        </article>

        <article class="card" @click="$emit('load-book')">
          <div class="card-icon">📚</div>
          <h3>Library</h3>
          <p>Reopen any saved project from the backend library and pick up right where you left off.</p>
          <span class="card-link">Browse saved books →</span>
        </article>

        <article class="card" @click="$emit('open-layout-builder')">
          <div class="card-icon">🧱</div>
          <h3>Layout Builder</h3>
          <p>Compose custom grids, overlays, and text treatments—then export them as reusable layouts.</p>
          <span class="card-link">Launch builder →</span>
        </article>

        <article class="card" @click="$emit('open-docs')">
          <div class="card-icon">📘</div>
          <h3>Guides & Examples</h3>
          <p>Discover best practices for sequencing, typography, and image rhythm to elevate every spread.</p>
          <span class="card-link">Read the guide →</span>
        </article>
      </section>
    </main>

    <footer class="landing-footer">
      <span>Made with ✨ by the Zino team • {{ new Date().getFullYear() }}</span>
      <span class="small">Version 0.1 – Layout engine powered by JSON & Vite</span>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useZineStore } from '../stores/zineStore'

const props = defineProps({
  loading: { type: Boolean, default: false },
  lastSavedSummary: { type: String, default: '' },
})

const emit = defineEmits(['create-new', 'load-book', 'open-layout-builder', 'open-docs'])

const zineStore = useZineStore()

const theme = computed(() => zineStore.ui.theme)

const toggleTheme = () => {
  zineStore.toggleTheme()
}

const previewLayouts = [
  {
    id: 'grid-hero',
    name: 'Hero Caption',
    tag: 'Combined',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'grid-asymmetric',
    name: 'Asymmetric Grid',
    tag: 'Editorial',
    image: 'https://images.unsplash.com/photo-1526481280695-3c4693f1b8d9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'grid-stack',
    name: 'Editorial Stack',
    tag: 'Narrative',
    image: 'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=400&q=80',
  },
]
</script>

<style scoped>
.landing {
  position: relative;
  min-height: 100vh;
  padding: 48px;
  display: flex;
  flex-direction: column;
  color: var(--text);
  background: var(--app-bg);
  overflow: hidden;
}

.theme-light .landing {
  background: radial-gradient(circle at top left, rgba(255, 137, 137, 0.12), transparent 50%),
    radial-gradient(circle at bottom right, rgba(126, 209, 255, 0.14), transparent 55%),
    var(--app-bg);
}

.theme-dark .landing {
  background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.15), transparent 50%),
    radial-gradient(circle at bottom right, rgba(52, 211, 153, 0.12), transparent 55%),
    var(--app-bg);
}

.background {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&w=1600&q=60') center/cover;
  opacity: 0.05;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.theme-dark .background {
  opacity: 0.08;
  mix-blend-mode: soft-light;
}

.landing-header,
.landing-footer {
  position: relative;
  z-index: 2;
}

.landing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 46px;
}

.title h1 {
  font-size: 34px;
  letter-spacing: -0.03em;
  margin: 0;
}

.title p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 15px;
}

.actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.landing-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 56px;
  margin-top: 40px;
}

.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: center;
  gap: 48px;
}

.hero-text h2 {
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-text p {
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 520px;
}

.hero-cta {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn.btn-ghost {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
}

.meta {
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.meta strong {
  color: var(--text);
}

.hero-preview {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.preview-card {
  width: 180px;
  background: var(--panel-bg);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
}

.preview-thumb {
  height: 140px;
  background-size: cover;
  background-position: center;
}

.preview-info {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-name {
  font-weight: 600;
}

.preview-tag {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.card {
  background: var(--panel-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 28px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.theme-dark .card {
  background: rgba(26, 32, 44, 0.6);
  border-color: rgba(75, 85, 99, 0.5);
}

.card-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.card h3 {
  margin-bottom: 12px;
  font-size: 20px;
}

.card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 18px;
}

.card-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.landing-footer {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 960px) {
  .landing {
    padding: 32px;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .hero-preview {
    justify-content: flex-start;
  }
}
</style>
