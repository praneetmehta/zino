# Ziner - Quick Start Guide

**Version**: 2.0.0  
**Last Updated**: December 30, 2024

---

## 🚀 Run Locally (5 Minutes)

### Step 1: Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../server
npm install
```

### Step 2: Start Backend
```bash
cd server
npm run dev

# Output:
# 📦 Using Filesystem storage provider
# ✅ Storage service initialized
# 📚 Ziner backend listening on http://localhost:4876
```

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev

# Output:
# VITE v5.0.0  ready in 500 ms
# ➜  Local: http://localhost:5173/
```

### Step 4: Open Browser
```
http://localhost:5173
```

**You're in!** Auto-logged as "Development User" - start creating! ✨

---

## 📋 What Was Built

### 1. Storage Abstraction (Backend)
**Location**: `server/services/storage/`

**Switch providers:**
```bash
# In server/.env
STORAGE_PROVIDER=filesystem  # Default
# or
STORAGE_PROVIDER=s3          # Production
```

**Frontend doesn't care** - it just calls `/books` API endpoint

### 2. Authentication System
**Development** (no login needed):
```bash
VITE_SKIP_AUTH=true  # Frontend
SKIP_AUTH=true       # Backend
```

**Production** (Google OAuth):
```bash
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=your-id
```

### 3. Role-Based Access
- **User**: Own books only
- **Admin**: All books + management

### 4. Environment Config
- **Frontend**: `frontend/.env.example` → `.env.development`
- **Backend**: `server/.env.example` → `.env`

---

## 🗂️ Project Structure

```
ziner/
├── frontend/                    # Vue 3 app
│   ├── src/
│   │   ├── api/books.js        # Simple API client
│   │   ├── services/auth/       # Google OAuth
│   │   ├── stores/              # Pinia stores
│   │   └── config/env.js        # Config
│   └── .env.development         # Dev config
│
├── server/                      # Express backend
│   ├── src/index.js            # Main app
│   ├── services/storage/        # Storage abstraction ⭐
│   ├── routes/auth.js          # Auth endpoints
│   ├── middleware/auth.js      # JWT middleware
│   └── data/
│       ├── books/              # Saved projects
│       └── uploads/            # Media files
│
└── docs/                        # Documentation
    ├── FINAL_SUMMARY.md        # Complete overview
    ├── ARCHITECTURE_CORRECTED.md  # Architecture
    └── DEPLOYMENT_CHECKLIST.md    # Deploy guide
```

---

## 🔧 Common Tasks

### Add Media Upload (Future)
```bash
# Backend
npm install multer

# Add route in server/src/index.js
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

app.post('/media', upload.single('file'), async (req, res) => {
  const result = await storageService.uploadFile(req.file, {
    userId: req.user?.id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
  })
  res.json(result)
})
```

### Switch to S3 Storage
```bash
# 1. Install AWS SDK
cd server
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 2. Update server/.env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket

# 3. Uncomment code in server/services/storage/S3Storage.js

# 4. Restart backend
npm restart

# Frontend: NO CHANGES NEEDED ✅
```

### Add Email/Password Auth (Future)
```bash
# Backend
npm install bcrypt

# Add to server/routes/auth.js
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  // Save user to database
  const token = generateToken(user)
  res.json({ user, token })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  // Find user, verify password
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  const token = generateToken(user)
  res.json({ user, token })
})
```

---

## 🐛 Troubleshooting

### "Cannot find module '@/services/storage'"
**Reason**: Storage service moved to backend  
**Fix**: Already fixed - frontend uses simple API client

### "CORS error"
**Reason**: Backend CORS not configured  
**Fix**:
```bash
# In server/.env
CORS_ORIGIN=http://localhost:5173
```

### "No token provided"
**Reason**: Auth required but not logged in  
**Fix**:
```bash
# In frontend/.env.development
VITE_SKIP_AUTH=true

# In server/.env
SKIP_AUTH=true
```

### "Books not showing up"
**Reason**: Filtered by userId in production  
**Fix**: Check `server/src/index.js` line 70-80, verify auth middleware

---

## 📚 Documentation

| When You Need... | Read This |
|------------------|-----------|
| **Overall summary** | `FINAL_SUMMARY.md` |
| **Architecture details** | `ARCHITECTURE_CORRECTED.md` |
| **Deployment guide** | `DEPLOYMENT_CHECKLIST.md` |
| **Full setup guide** | `PRODUCTION_SETUP.md` |
| **Quick reference** | This file |

---

## ✅ Checklist

### Development
- [x] Storage abstraction on backend
- [x] Auth system (Google OAuth)
- [x] Role-based access (user/admin)
- [x] Environment configuration
- [x] Development mode (no auth)

### Before Production
- [ ] Set up Google OAuth credentials
- [ ] Choose storage provider (S3 recommended)
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Set up error tracking (Sentry)
- [ ] Enable HTTPS

### After Deployment
- [ ] Test login flow
- [ ] Test create/save/load
- [ ] Test permissions
- [ ] Monitor errors
- [ ] Check performance

---

## 🎯 Key Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build frontend
npm start           # Start backend (production)

# Testing
npm test            # Run tests (TODO)

# Database (Future)
npm run migrate     # Run migrations
npm run seed        # Seed data
```

---

## 📞 Quick Help

**Starting locally?** → Run both servers, visit localhost:5173  
**Deploying?** → Follow `DEPLOYMENT_CHECKLIST.md`  
**Architecture question?** → Read `ARCHITECTURE_CORRECTED.md`  
**Auth not working?** → Set `VITE_SKIP_AUTH=true` for dev  
**Storage question?** → It's on backend now, not frontend  

---

**Ready to build!** 🚀📚✨
