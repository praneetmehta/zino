<template>
  <div class="landing" :class="`theme-${theme}`">
    <div class="background"></div>
    <header class="landing-header">
      <div class="brand">
        <span class="logo">📚</span>
        <div class="title">
          <h1>Zino</h1>
          <p class="subtitle">by <a href="https://instagram.com/the_talking_streets" target="_blank" class="tts-link">@the_talking_streets</a></p>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-outline" @click="toggleTheme">
          <span v-if="theme === 'light'">🌙</span>
          <span v-else>☀️</span>
          <span class="label">{{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
        <UserProfile />
      </div>
    </header>

    <main class="landing-content">
      <section class="hero">
        <div class="hero-text">
          <h2><span style="color: orange">Design </span>Your Story.
            <br />
            Print Your <span style="color: #95d92d">Vision.</span></h2>
          <p class="hero-description">
            Create stunning hand-bound photobooks with Zino's intuitive designer.
            <strong>Design is free</strong> — bring your vision to life with custom layouts, 
            then order a professionally printed, hand-bound book delivered to your door.
          </p>
          <p class="hero-subtext">
            <template v-if="!authStore.isAuthenticated">
              🎨 Try the demo with a sample photobook, or sign in to design your own.
            </template>
            <template v-else>
              📚 Create, save, and order your custom photobooks.
            </template>
          </p>
          <div class="hero-cta">
            <!-- Non-logged in users -->
            <template v-if="!authStore.isAuthenticated">
              <button class="btn btn-primary" @click="$emit('try-demo')">
                🎨 Try Demo
              </button>
              <button class="btn btn-ghost" @click="$emit('require-login', 'create')">
                Sign In to Create
              </button>
            </template>
            
            <!-- Logged in users -->
            <template v-else>
              <button class="btn btn-primary" @click="$emit('create-new')">Create a Book</button>
              <button class="btn btn-ghost" :disabled="loading" @click="$emit('load-book')">
                <span v-if="loading">🔍 Loading…</span>
                <span v-else>📂 Open from Library</span>
              </button>
            </template>
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
          
          <!-- Instagram Testimonial Card -->
          <div class="preview-card instagram-card">
            <div class="preview-thumb instagram-embed-container">
              <iframe 
                src="https://www.instagram.com/p/DQwGZJhCTlP/embed" 
                frameborder="0" 
                scrolling="no" 
                allowtransparency="true"
                class="instagram-embed-frame"
              ></iframe>
            </div>
            <div class="preview-info">
              <a href="https://www.instagram.com/p/DQwGZJhCTlP/" target="_blank" class="instagram-link">
                <span class="preview-name">Handmade Book</span>
                <span class="preview-tag" style="font-size: 10px; color: var(--text-muted)">@the_talking_streets</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="grid">
        <!-- How It Works Section -->
        <article class="card feature-card">
          <div class="card-number">01</div>
          <div class="card-icon">🎨</div>
          <h3>Design Your Book</h3>
          <p>Use our free photobook designer to create stunning layouts. Choose from curated templates or build custom spreads with drag-and-drop simplicity.</p>
        </article>

        <article class="card feature-card">
          <div class="card-number">02</div>
          <div class="card-icon">📚</div>
          <h3>Choose Your Style</h3>
          <p>Select from premium cover materials, binding styles, and paper finishes. Each book is hand-bound with care and attention to detail.</p>
          <span class="coming-soon">Coming Soon</span>
        </article>

        <article class="card feature-card">
          <div class="card-number">03</div>
          <div class="card-icon">📦</div>
          <h3>Delivered to You</h3>
          <p>We print and hand-bind your photobook, then ship it directly to your door. Quality craftsmanship meets your creative vision.</p>
          <span class="coming-soon">Coming Soon</span>
        </article>
        
        <!-- Action Cards -->
        <template v-if="authStore.isAuthenticated">
          <article class="card action-card" @click="$emit('create-new')">
            <div class="card-icon">✨</div>
            <h3>Start Creating</h3>
            <p>Begin a new photobook project with full access to layouts and customization.</p>
            <span class="card-link">Create now →</span>
          </article>

          <article class="card action-card" @click="$emit('load-book')">
            <div class="card-icon">📋</div>
            <h3>Your Projects</h3>
            <p>Access your saved photobooks and continue where you left off.</p>
            <span class="card-link">View library →</span>
          </article>
        </template>
        
        <template v-else>
          <article class="card action-card primary" @click="$emit('try-demo')">
            <div class="card-icon">🚀</div>
            <h3>Try the Designer</h3>
            <p>Explore the photobook editor with a sample project. No sign-up required.</p>
            <span class="card-link">Launch demo →</span>
          </article>

          <article class="card action-card" @click="$emit('require-login', 'create')">
            <div class="card-icon">🔑</div>
            <h3>Sign In to Save</h3>
            <p>Create an account to save your designs and order printed books.</p>
            <span class="card-link">Get started →</span>
          </article>
        </template>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo">📸</span>
          <div>
            <strong>Zino</strong>
            <p>Hand-bound photobooks for your stories</p>
          </div>
        </div>
        <div class="footer-links">
          <a href="https://instagram.com/the_talking_streets" target="_blank" class="footer-link">
            <span>📷</span> @the_talking_streets
          </a>
          <a href="#" class="footer-link" @click.prevent="$emit('open-docs')">
            <span>📖</span> How to Design
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} The Talking Streets. Crafted with care in India.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useZineStore } from '../stores/zineStore'
import { useAuthStore } from '../stores/authStore'
import UserProfile from './UserProfile.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  lastSavedSummary: { type: String, default: '' },
})

const emit = defineEmits(['create-new', 'load-book', 'open-layout-builder', 'open-docs', 'try-demo', 'require-login'])

const authStore = useAuthStore()
const zineStore = useZineStore()

// Force auth store initialization on mount
onMounted(async () => {
  console.log(' LandingPage mounted')
  console.log('Auth state check:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    userName: authStore.userName,
    userEmail: authStore.userEmail,
    isInitialized: authStore.isInitialized
  })

  if (!authStore.isInitialized) {
    console.log('Initializing auth store...')
    await authStore.init()
    console.log('Auth store initialized:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user
    })
  }
})

const toggleTheme = () => {
  zineStore.toggleTheme()
}

const previewLayouts = [
  
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

.subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.tts-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.tts-link:hover {
  color: color-mix(in srgb, var(--accent) 80%, white);
  text-decoration: underline;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 10;
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

.hero-description {
  font-size: 18px;
  margin-bottom: 16px;
}

.hero-description strong {
  color: var(--accent);
  font-weight: 700;
}

.hero-subtext {
  font-size: 15px;
  opacity: 0.9;
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
  align-items: flex-start;
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

/* Feature Cards */
.feature-card {
  position: relative;
  cursor: default;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.card-number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  font-weight: 900;
  color: var(--accent);
  opacity: 0.15;
  line-height: 1;
}

.coming-soon {
  display: inline-block;
  margin-top: 12px;
  padding: 6px 12px;
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 6px;
}

/* Action Cards */
.action-card {
  border: 2px solid var(--border);
}

.action-card.primary {
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, purple));
  border: none;
  color: white;
}

.action-card.primary h3,
.action-card.primary p {
  color: white;
}

.action-card.primary .card-link {
  color: white;
  opacity: 0.95;
}

.action-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
}

.action-card.primary:hover {
  transform: translateY(-6px) scale(1.02);
}

.landing-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 13px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 24px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-brand .logo {
  font-size: 36px;
}

.footer-brand strong {
  display: block;
  font-size: 18px;
  color: var(--text);
  margin-bottom: 4px;
}

.footer-brand p {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--accent);
}

.footer-link span {
  font-size: 16px;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  opacity: 0.8;
}

/* Instagram Preview Card */
.instagram-card {
  position: relative;
  transition: all 0.3s ease;
  width: 270px; /* 1.5x the regular card width (180px) */
}

.instagram-card:hover {
  transform: translateY(-8px);
}

.instagram-embed-container {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.instagram-embed-frame {
  width: 100%;
  height: 160%;
  border: none;
  overflow: hidden;
  pointer-events: auto;
  position: absolute;
  top: -10px;
  left: 0;
}

.instagram-link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.instagram-link:hover {
  opacity: 0.8;
}

.instagram-card .preview-tag {
  color: var(--accent);
  font-weight: 600;
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
