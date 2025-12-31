<template>
  <div class="user-profile">
    <!-- Not logged in -->
    <button v-if="!authStore.isAuthenticated" class="login-btn" @click="showLoginModal = true">
      <span class="icon">👤</span>
      <span>Sign In</span>
    </button>

    <!-- Logged in - Show profile -->
    <div v-else ref="menuButtonRef" class="user-menu" @click="toggleMenu">
      <div class="user-avatar" :class="{ 'temp-user': authStore.isTemp }">
        {{ userInitials }}
      </div>
      <div class="user-info">
        <div class="user-name">{{ authStore.userName }}</div>
        <div class="user-role">{{ authStore.userRole }}</div>
      </div>
      <span class="dropdown-icon">▼</span>
    </div>

    <!-- Dropdown Menu (teleported to body to escape stacking context) -->
    <Teleport to="body">
      <div v-if="menuOpen" class="dropdown-menu" :style="dropdownPosition" @click.stop>
        <div class="menu-header">
          <div class="avatar-large" :class="{ 'temp-user': authStore.isTemp }">
            {{ userInitials }}
          </div>
          <div class="user-details">
            <div class="name">{{ authStore.userName }}</div>
            <div class="email">{{ authStore.userEmail }}</div>
            <div v-if="authStore.isTemp" class="badge dev-badge">Development Mode</div>
            <div v-else-if="authStore.isAdmin" class="badge admin-badge">Admin</div>
          </div>
        </div>

        <div class="menu-divider"></div>

        <div class="menu-items">
          <button class="menu-item" @click="viewProfile">
            <span class="item-icon">👤</span>
            <span>Profile Settings</span>
          </button>
          <button class="menu-item" @click="viewLibrary">
            <span class="item-icon">📚</span>
            <span>My Library</span>
            <span class="count">{{ bookCount }}</span>
          </button>
          <button class="menu-item" @click="viewPublications">
            <span class="item-icon">📄</span>
            <span>Published PDFs</span>
          </button>
          <button v-if="authStore.isAdmin" class="menu-item" @click="viewAdmin">
            <span class="item-icon">⚙️</span>
            <span>Admin Dashboard</span>
          </button>
        </div>

        <div class="menu-divider"></div>

        <button class="menu-item logout" @click="handleLogout">
          <span class="item-icon">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </Teleport>

    <!-- Login Modal -->
    <LoginModal :is-open="showLoginModal" @close="showLoginModal = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useZineStore } from '@/stores/zineStore'
import LoginModal from './LoginModal.vue'

const authStore = useAuthStore()
const zineStore = useZineStore()
const menuOpen = ref(false)
const showLoginModal = ref(false)
const menuButtonRef = ref(null)
const dropdownPosition = ref({})

const userInitials = computed(() => {
  const name = authStore.userName
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const bookCount = computed(() => {
  // Would come from API in real implementation
  return zineStore.pages.length
})

function toggleMenu(event) {
  menuOpen.value = !menuOpen.value
  
  if (menuOpen.value) {
    // Calculate position relative to the button
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    dropdownPosition.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      right: `${window.innerWidth - rect.right}px`,
    }
  }
}

function viewProfile() {
  menuOpen.value = false
  alert('Profile settings coming soon!')
}

function viewLibrary() {
  menuOpen.value = false
  // Trigger library modal
  document.querySelector('[data-action="load"]')?.click()
}

function viewPublications() {
  menuOpen.value = false
  // Emit event to parent to show publications modal
  window.dispatchEvent(new CustomEvent('show-publications'))
}

function viewAdmin() {
  menuOpen.value = false
  alert('Admin dashboard coming soon!')
}

async function handleLogout() {
  menuOpen.value = false
  
  if (confirm('Are you sure you want to sign out?')) {
    await authStore.logout()
    showLoginModal.value = true
  }
}

// Close menu when clicking outside (works with teleported dropdown)
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu') && !e.target.closest('.dropdown-menu')) {
      menuOpen.value = false
    }
  })
  
  // Close on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen.value) {
      menuOpen.value = false
    }
  })
}
</script>

<style scoped>
.user-profile {
  position: relative;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: color-mix(in srgb, var(--accent) 90%, black);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-btn .icon {
  font-size: 18px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--muted);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.user-menu:hover {
  background: var(--border);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, purple));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-avatar.temp-user {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  position: relative;
}

.user-avatar.temp-user::after {
  content: '🔧';
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 12px;
  background: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: capitalize;
}

.dropdown-icon {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.user-menu:hover .dropdown-icon {
  transform: translateY(2px);
}

/* Dropdown Menu (teleported to body - needs !important for theme vars) */
.dropdown-menu {
  /* position and top/right set via inline style */
  width: 280px;
  background: var(--panel-bg-solid);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
  padding: 16px;
  z-index: 99998;
  animation: menuSlideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Ensure colors work when teleported */
  color: var(--text);
}

@keyframes menuSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, purple));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar-large.temp-user {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details .name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details .email {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.dev-badge {
  background: color-mix(in srgb, #f59e0b 20%, transparent);
  color: #f59e0b;
}

.admin-badge {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  color: var(--accent);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background: var(--muted);
}

.menu-item.logout {
  color: #ef4444;
}

.menu-item.logout:hover {
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

.item-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.count {
  margin-left: auto;
  background: var(--muted);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>

<!-- Unscoped styles for teleported dropdown -->
<style>
/* Teleported dropdown needs global styles to work with theme */
.dropdown-menu {
  font-family: inherit;
}

.dropdown-menu .menu-item:hover {
  background: var(--muted);
}

.dropdown-menu .menu-item.logout:hover {
  background: color-mix(in srgb, #ef4444 10%, transparent);
}
</style>
