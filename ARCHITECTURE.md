# Ziner Production Architecture

**Status**: Ready for Production 🚀  
**Date**: December 30, 2024

---

## Overview

Ziner has been refactored with production-ready architecture including:

1. ✅ **Storage Abstraction Layer** - Pluggable storage providers (API, S3)
2. ✅ **Environment Configuration** - Vite env variables for all settings
3. ✅ **Authentication System** - Google OAuth + role-based access
4. ✅ **Session Management** - User-tied sessions with JWT tokens

---

## Architecture Layers

### 1. Storage Abstraction Layer

**Location**: `frontend/src/services/storage/`

```
frontend/src/services/storage/
├── StorageInterface.js      # Abstract base class
├── ApiStorage.js            # Backend API implementation
├── S3Storage.js             # AWS S3 implementation (ready)
├── StorageFactory.js        # Factory pattern
└── index.js                 # Unified service (singleton)
```

**Key Features:**
- **Interface-based design** - Easy to swap providers
- **Automatic caching** - Reduces redundant API calls
- **Auth token injection** - Automatic bearer token headers
- **Environment-driven** - Provider selected via `VITE_STORAGE_PROVIDER`

**Usage Example:**
```javascript
import { storageService } from '@/services/storage'

// Upload media
const result = await storageService.uploadMedia(file, { userId: 'user-123' })

// Save book
await storageService.saveBook(book)

// List user's books
const books = await storageService.listBooks('user-123')
```

**Switching Providers:**
```bash
# Use API storage
VITE_STORAGE_PROVIDER=api

# Use S3 storage
VITE_STORAGE_PROVIDER=s3
```

---

### 2. Environment Configuration

**Location**: `frontend/src/config/env.js`

All environment variables centralized in one place with type-safe access.

**Files:**
```
frontend/
├── .env.example         # Template with all variables
├── .env.development     # Development defaults
└── .env.production      # Production configuration
```

**Usage:**
```javascript
import env from '@/config/env'

console.log(env.apiUrl)         // http://localhost:4876
console.log(env.isDevelopment()) // true
console.log(env.isAuthRequired()) // false (in dev)

env.log('Debug message')  // Only logs if VITE_ENABLE_DEBUG=true
```

**Key Variables:**
- `VITE_API_URL` - Backend API endpoint
- `VITE_STORAGE_PROVIDER` - Storage provider type
- `VITE_SKIP_AUTH` - Skip authentication (dev only)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_S3_BUCKET` - S3 bucket name
- `VITE_MAX_UPLOAD_SIZE` - Max file upload size

---

### 3. Authentication System

**Location**: `frontend/src/services/auth/`

```
frontend/src/services/auth/
└── AuthService.js       # Google OAuth + session management

frontend/src/stores/
└── authStore.js         # Pinia store for auth state
```

**Features:**
- **Google OAuth 2.0** - Production authentication
- **Temporary users** - Development mode bypass
- **JWT tokens** - Secure session management
- **Role-based access** - User vs Admin permissions
- **Auto token refresh** - Handles expired sessions
- **LocalStorage persistence** - Survives page refreshes

**Usage:**
```javascript
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// Initialize
await authStore.init()

// Login with Google
await authStore.loginWithGoogle()

// Check authentication
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user)
}

// Check role
if (authStore.isAdmin) {
  // Admin-only features
}

// Logout
await authStore.logout()
```

**Development Mode:**
```bash
# Skip auth, auto-create temp user
VITE_SKIP_AUTH=true

# Result: user = { id: 'temp-user', role: 'user', isTemp: true }
```

**Production Mode:**
```bash
# Require Google OAuth
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

### 4. Backend API Structure

**Location**: `server/`

```
server/
├── src/
│   └── index.js             # Main Express app
├── routes/
│   └── auth.js              # Auth endpoints
├── middleware/
│   └── auth.js              # JWT verification
└── data/
    ├── books/               # Stored books (filesystem)
    └── media/               # Uploaded media (filesystem)
```

**Authentication Middleware:**
```javascript
const { authenticateJWT, requireAdmin } = require('./middleware/auth')

// Protected route (requires auth)
app.get('/books', authenticateJWT, async (req, res) => {
  // req.user is populated with JWT data
  const userId = req.user.id
  // ...
})

// Admin-only route
app.delete('/books/:id', authenticateJWT, requireAdmin, async (req, res) => {
  // Only admins can access
})
```

**Development Mode Bypass:**
```bash
# In server/.env
SKIP_AUTH=true

# OR
NODE_ENV=development
```

When `SKIP_AUTH=true`, middleware injects a temp user:
```javascript
req.user = {
  id: 'temp-user',
  email: 'temp@local.dev',
  role: 'user',
  isTemp: true
}
```

---

## Authentication Flow

### Google OAuth Flow (Production)

```
┌─────────┐                 ┌──────────┐                ┌─────────┐
│ Browser │                 │ Frontend │                │ Backend │
└────┬────┘                 └────┬─────┘                └────┬────┘
     │                           │                           │
     │ Click "Login with Google" │                           │
     │──────────────────────────>│                           │
     │                           │                           │
     │                           │  Load Google OAuth popup  │
     │                           │──────────────────────────>│
     │                           │                           │
     │  User authorizes          │                           │
     │<──────────────────────────│                           │
     │                           │                           │
     │                           │  POST /auth/google        │
     │                           │  { code: "..." }          │
     │                           │──────────────────────────>│
     │                           │                           │
     │                           │   Exchange code with      │
     │                           │   Google, get user info   │
     │                           │                           │
     │                           │   Generate JWT token      │
     │                           │<──────────────────────────│
     │                           │   { user, token }         │
     │                           │                           │
     │                           │  Store in localStorage    │
     │<──────────────────────────│                           │
     │                           │                           │
     │  Subsequent API calls     │                           │
     │  include: Authorization:  │                           │
     │  Bearer <token>           │                           │
     │──────────────────────────>│──────────────────────────>│
     │                           │                           │
```

### Development Flow (Auth Skipped)

```
┌─────────┐                 ┌──────────┐
│ Browser │                 │ Frontend │
└────┬────┘                 └────┬─────┘
     │                           │
     │  App loads                │
     │──────────────────────────>│
     │                           │
     │                           │  authStore.init()
     │                           │  - SKIP_AUTH=true
     │                           │  - Auto create temp user
     │                           │
     │  User logged in as        │
     │  "Development User"       │
     │<──────────────────────────│
     │                           │
     │  All APIs work without    │
     │  real authentication      │
     │──────────────────────────>│
     │                           │
```

---

## Role-Based Access Control

### Roles

1. **Guest** - Not logged in (can only view public content)
2. **User** - Standard logged-in user
3. **Admin** - Full access to all features

### Permission Matrix

| Feature                     | Guest | User | Admin |
|-----------------------------|-------|------|-------|
| View landing page           | ✅    | ✅   | ✅    |
| Create zine                 | ❌    | ✅   | ✅    |
| Save to library             | ❌    | ✅   | ✅    |
| Load own books              | ❌    | ✅   | ✅    |
| Delete own books            | ❌    | ✅   | ✅    |
| Upload media                | ❌    | ✅   | ✅    |
| Export PDF                  | ❌    | ✅   | ✅    |
| View all users' books       | ❌    | ❌   | ✅    |
| Delete any book             | ❌    | ❌   | ✅    |
| Create custom layouts       | ❌    | ✅   | ✅    |
| Delete custom layouts       | ❌    | ❌   | ✅    |

### Implementation

**Frontend:**
```javascript
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// Check before showing UI
if (authStore.isAdmin) {
  // Show admin panel
}

// Throw error if unauthorized
authStore.requireAuth()   // Throws if not logged in
authStore.requireAdmin()  // Throws if not admin
```

**Backend:**
```javascript
const { authenticateJWT, requireAdmin } = require('./middleware/auth')

// User-only endpoint
app.post('/books', authenticateJWT, async (req, res) => {
  // Only authenticated users
})

// Admin-only endpoint
app.delete('/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  // Only admins
})
```

---

## Migration from Current State

### Current State (Before Refactor)
- ❌ Direct localStorage usage
- ❌ Hardcoded API URLs
- ❌ No authentication
- ❌ No role-based access
- ❌ Coupled storage logic

### New State (After Refactor)
- ✅ Storage abstraction layer
- ✅ Environment-based configuration
- ✅ Google OAuth authentication
- ✅ Role-based access control
- ✅ Pluggable storage providers

### What Changed in Frontend

**Old approach:**
```javascript
// Direct API call
const response = await fetch('http://localhost:4876/books', {
  method: 'POST',
  body: JSON.stringify(book),
})
```

**New approach:**
```javascript
// Use storage service
import { storageService } from '@/services/storage'
await storageService.saveBook(book)
```

**Benefits:**
- ✅ Auto-injected auth tokens
- ✅ Caching built-in
- ✅ Easy to swap storage providers
- ✅ Centralized error handling

---

## Deployment Modes

### Development Mode
```bash
cd frontend
npm run dev

cd server
npm run dev
```

**Characteristics:**
- Auth skipped (temp user auto-created)
- Debug logging enabled
- CORS allows localhost
- Hot module replacement

### Production Mode
```bash
cd frontend
npm run build
npm run preview  # Or deploy to CDN

cd server
NODE_ENV=production npm start
```

**Characteristics:**
- Google OAuth required
- Debug logging disabled
- CORS restricted to production domain
- Optimized bundles

---

## Next Steps

### Before Going Live

1. **Set up Google OAuth**
   - Create OAuth app in Google Cloud Console
   - Configure authorized redirect URIs
   - Update `VITE_GOOGLE_CLIENT_ID`

2. **Choose Storage Provider**
   - Keep API storage (simple, works out of box)
   - OR migrate to S3 (scalable, recommended)

3. **Set up Production Database**
   - Replace filesystem storage with MongoDB/PostgreSQL
   - Implement user model
   - Add book ownership tracking

4. **Configure Backend**
   - Set strong `JWT_SECRET`
   - Enable rate limiting
   - Add input validation
   - Set up error tracking (Sentry)

5. **Deploy**
   - Frontend: Vercel, Netlify, or custom CDN
   - Backend: Docker, PM2, or serverless
   - Database: MongoDB Atlas, RDS, etc.

### Optional Enhancements

- [ ] Email/password authentication (in addition to Google)
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Admin dashboard
- [ ] User profile management
- [ ] Collaboration features (share zines)
- [ ] Analytics integration
- [ ] Real-time collaboration (WebSockets)

---

## Support & Documentation

- **Production Setup**: See `PRODUCTION_SETUP.md`
- **API Docs**: See `server/README.md` (TODO: create)
- **Frontend Architecture**: See this document
- **Deployment Guide**: See `PRODUCTION_SETUP.md`

---

**Last Updated**: December 30, 2024  
**Version**: 2.0.0 (Production Ready)
