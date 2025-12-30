# Ziner - Production Ready Guide

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: December 30, 2024

---

## 🎯 Quick Start

### Development Mode (No Auth Required)

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../server && npm install

# 2. Start backend
cd server
npm run dev

# 3. Start frontend (in new terminal)
cd frontend
npm run dev

# 4. Open browser
# Visit: http://localhost:5173
# Auto-logged in as "Development User"
```

### Production Mode (With Google OAuth)

```bash
# 1. Configure environment
cp frontend/.env.example frontend/.env.production
# Edit .env.production with your values

# 2. Set up Google OAuth
# See PRODUCTION_SETUP.md for detailed instructions

# 3. Build and deploy
cd frontend
npm run build

cd server
NODE_ENV=production npm start
```

---

## 📦 What's New in V2.0

### 1. Storage Abstraction Layer
- ✅ Pluggable storage providers (API, S3)
- ✅ Easy to switch between providers
- ✅ Automatic caching and auth token injection
- ✅ Ready for cloud storage (S3, GCS, Azure)

**Location**: `frontend/src/services/storage/`

### 2. Environment Configuration
- ✅ Centralized env variable management
- ✅ Separate dev/prod configurations
- ✅ Type-safe env access
- ✅ Feature flags support

**Files**:
- `frontend/.env.example` - Template
- `frontend/.env.development` - Dev defaults
- `frontend/.env.production` - Prod config

### 3. Authentication System
- ✅ Google OAuth 2.0 integration
- ✅ JWT token-based sessions
- ✅ Role-based access control (User/Admin)
- ✅ Development mode bypass
- ✅ LocalStorage persistence

**Location**: `frontend/src/services/auth/`

### 4. Backend Auth Middleware
- ✅ JWT verification
- ✅ Role-based route protection
- ✅ Development mode bypass
- ✅ Auth endpoints (/auth/google, /auth/logout, /auth/me)

**Location**: `server/middleware/auth.js`

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────┐
│                   Frontend (Vue 3)                 │
│                                                     │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Auth Store   │  │   Storage   │  │   Env    │ │
│  │ (Pinia)      │  │   Service   │  │  Config  │ │
│  └──────────────┘  └─────────────┘  └──────────┘ │
│         │                  │                       │
│         └──────────────────┴───────────────────────┤
│                            │                       │
└────────────────────────────┼───────────────────────┘
                             │ HTTPS + JWT
                             │
┌────────────────────────────▼───────────────────────┐
│                Backend (Express)                    │
│                                                     │
│  ┌────────────────┐  ┌──────────────────────────┐ │
│  │ Auth Middleware│  │   Storage Adapters       │ │
│  │  - JWT Verify  │  │   - Filesystem           │ │
│  │  - Role Check  │  │   - S3 (future)          │ │
│  └────────────────┘  └──────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼──────┐   ┌─────▼──────┐
              │    DB      │   │   Cloud    │
              │ (Future)   │   │  Storage   │
              └────────────┘   └────────────┘
```

---

## 🔐 Authentication Flow

### Development Mode
- **Auth**: Skipped
- **User**: Auto-created temp user
- **Config**: `VITE_SKIP_AUTH=true`

### Production Mode
1. User clicks "Login with Google"
2. Google OAuth popup opens
3. User authorizes
4. Frontend receives auth code
5. Frontend sends code to backend `/auth/google`
6. Backend exchanges code with Google
7. Backend creates/updates user in database
8. Backend generates JWT token
9. Frontend stores token + user in localStorage
10. All subsequent API calls include `Authorization: Bearer <token>`

---

## 🗂️ File Structure

```
ziner/
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── storage/          # Storage abstraction layer
│   │   │   └── auth/             # Authentication service
│   │   ├── stores/
│   │   │   ├── zineStore.js      # Zine state management
│   │   │   └── authStore.js      # Auth state management
│   │   ├── config/
│   │   │   └── env.js            # Environment configuration
│   │   └── components/           # Vue components
│   ├── .env.example              # Env template
│   ├── .env.development          # Dev config
│   └── .env.production           # Prod config (create this)
│
├── server/
│   ├── src/
│   │   └── index.js              # Express app
│   ├── routes/
│   │   └── auth.js               # Auth endpoints
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   └── data/
│       └── books/                # Saved books
│
├── ARCHITECTURE.md               # Architecture deep-dive
├── PRODUCTION_SETUP.md           # Production deployment guide
└── README_PRODUCTION.md          # This file
```

---

## ⚙️ Configuration

### Frontend Environment Variables

```bash
# Required
VITE_API_URL=http://localhost:4876
VITE_STORAGE_PROVIDER=api           # 'api' or 's3'

# Authentication
VITE_SKIP_AUTH=true                 # true (dev) | false (prod)
VITE_GOOGLE_CLIENT_ID=your-id       # Required in production

# Optional
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
VITE_MAX_UPLOAD_SIZE=10485760
```

### Backend Environment Variables

```bash
# Server
NODE_ENV=development
PORT=4876
CORS_ORIGIN=http://localhost:5173

# Authentication (Production only)
SKIP_AUTH=true                      # Skip auth in dev
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-secret
JWT_SECRET=your-jwt-secret

# Storage (If using S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket
```

---

## 🚀 Deployment

### Option 1: Quick Deploy (Vercel + Railway)

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
cd server
railway up
```

### Option 2: Docker

```bash
# Build
docker-compose build

# Run
docker-compose up -d
```

### Option 3: Traditional Server

See `PRODUCTION_SETUP.md` for detailed Nginx, PM2, and systemd configurations.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | Detailed architecture overview |
| `PRODUCTION_SETUP.md` | Step-by-step production setup |
| `frontend/src/services/storage/README.md` | Storage abstraction docs |
| `frontend/src/services/auth/README.md` | Authentication docs |
| `BUGFIXES.md` | Recent bug fixes |
| `frontend/BUGFIXES.md` | Frontend-specific fixes |

---

## 🔒 Security

### Current Implementation
- ✅ JWT token-based authentication
- ✅ HTTPS ready (configure in production)
- ✅ CORS configuration
- ✅ Environment variable protection (.gitignore)
- ✅ Role-based access control

### Production Recommendations
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement CSRF protection
- [ ] Add input validation (joi, yup)
- [ ] Set up Web Application Firewall
- [ ] Enable security headers (helmet.js)
- [ ] Add SQL/NoSQL injection protection
- [ ] Set up error tracking (Sentry)

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run test        # Unit tests
npm run test:e2e    # E2E tests (TODO)
```

### Backend
```bash
cd server
npm run test        # API tests (TODO)
```

---

## 📊 Monitoring

### Development
- Console logs (auto-enabled with `VITE_ENABLE_DEBUG=true`)
- Browser DevTools

### Production (Recommended)
- **Error Tracking**: Sentry
- **Performance**: Lighthouse CI
- **Uptime**: UptimeRobot
- **Analytics**: Plausible or Google Analytics
- **Logs**: Logtail or CloudWatch

---

## 🐛 Troubleshooting

### Issue: "No token provided"
**Solution**: Check `VITE_SKIP_AUTH` in development or ensure user is logged in.

### Issue: "Invalid token format"
**Solution**: Clear localStorage and re-login.

### Issue: "Failed to load Google Identity Services"
**Solution**: Check `VITE_GOOGLE_CLIENT_ID` is set correctly.

### Issue: "CORS error"
**Solution**: Update `CORS_ORIGIN` in backend to match frontend URL.

### Issue: "Storage provider not found"
**Solution**: Check `VITE_STORAGE_PROVIDER` is set to 'api' or 's3'.

---

## 🛠️ Development Workflow

1. **Make changes** in `frontend/src/` or `server/src/`
2. **Test locally** with `npm run dev`
3. **Commit changes** with clear message
4. **Deploy to staging** (optional)
5. **Deploy to production**

```bash
# Example workflow
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
# Create PR, review, merge
# Deploy
```

---

## 📞 Support

- **Issues**: Open a GitHub issue
- **Email**: your-email@domain.com
- **Docs**: See `ARCHITECTURE.md` and `PRODUCTION_SETUP.md`

---

## ✨ Features Roadmap

### Completed ✅
- Storage abstraction layer
- Environment configuration
- Google OAuth authentication
- Role-based access control
- JWT session management

### Planned 🔜
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Email/password authentication
- [ ] Two-factor authentication
- [ ] Admin dashboard
- [ ] User profile management
- [ ] Real-time collaboration
- [ ] Version history
- [ ] Team workspaces
- [ ] Advanced analytics

---

**Happy Publishing!** 📚✨
