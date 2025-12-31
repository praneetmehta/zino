<template>
  <div class="portfolio-landing">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="brand-title">The Talking Streets</h1>
        <p class="tagline">Stories Through Streets, Captured in Frames</p>
        <p class="description">
          A photography collective documenting urban narratives, cultural moments, 
          and the stories that unfold in the spaces we inhabit.
        </p>
        
        <div class="social-links">
          <a href="https://instagram.com/the_talking_streets" target="_blank" class="social-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="6" r="1" fill="currentColor"/>
            </svg>
            <span>@the_talking_streets</span>
          </a>
        </div>

        <div class="projects">
          <h2>Projects</h2>
          <div class="project-cards">
            <a href="/zino" class="project-card zino-card">
              <div class="project-icon">📚</div>
              <h3>Zino</h3>
              <p>Design & print custom photobooks</p>
              <span class="project-link">Launch App →</span>
            </a>
            
            <div class="project-card coming-soon">
              <div class="project-icon">📸</div>
              <h3>Gallery</h3>
              <p>Explore our photo collections</p>
              <span class="project-badge">Coming Soon</span>
            </div>
            
            <div class="project-card coming-soon">
              <div class="project-icon">🎨</div>
              <h3>Workshops</h3>
              <p>Photography & storytelling sessions</p>
              <span class="project-badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="portfolio-footer">
      <p>&copy; 2024 The Talking Streets. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
// No logic needed for now
</script>

<style scoped>
.portfolio-landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.hero-content {
  max-width: 1000px;
  width: 100%;
  text-align: center;
}

.brand-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  background: linear-gradient(to right, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -2px;
}

.tagline {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 auto 40px;
  max-width: 600px;
  opacity: 0.85;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 60px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.projects {
  margin-top: 40px;
}

.projects h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 30px 0;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.project-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover::before {
  opacity: 1;
}

.zino-card {
  cursor: pointer;
  text-decoration: none;
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
}

.zino-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
}

.project-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.project-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.project-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.project-link {
  display: inline-block;
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.zino-card:hover .project-link {
  background: rgba(255, 255, 255, 0.3);
}

.project-badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  opacity: 0.8;
}

.portfolio-footer {
  padding: 30px 20px;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.portfolio-footer p {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .brand-title {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 1.2rem;
  }

  .description {
    font-size: 1rem;
  }

  .project-cards {
    grid-template-columns: 1fr;
  }
}
</style>
