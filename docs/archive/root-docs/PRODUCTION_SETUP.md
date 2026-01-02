# Production Setup Guide

This guide explains how to configure and deploy Ziner for production use.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Storage Configuration](#storage-configuration)
3. [Authentication Setup](#authentication-setup)
4. [Environment Variables](#environment-variables)
5. [Backend Implementation](#backend-implementation)
6. [Deployment](#deployment)

---

## Architecture Overview

```
┌──────────────┐
│   Frontend   │ (Vue + Vite)
│   (Browser)  │
└──────┬───────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼───────────────────────┐
│   Backend API Server         │
│   (Express / Node.js)        │
│                              │
│  ┌────────────────────────┐ │
│  │  Auth Middleware       │ │
│  │  - Google OAuth        │ │
│  │  - JWT Tokens          │ │
│  │  - Role-based Access   │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  Storage Adapters      │ │
│  │  - S3 / Local / DB     │ │
│  └────────────────────────┘ │
└──────┬──────────┬────────────┘
       │          │
   ┌───▼──┐   ┌──▼────┐
   │  S3  │   │  DB   │
   │Cloud │   │(Mongo/│
   │Storage│   │MySQL)│
   └──────┘   └───────┘
```

---

## Storage Configuration

### Option 1: API Storage (Default)

All media and books stored via backend API endpoints.

**Frontend:**
```javascript
// .env.production
VITE_STORAGE_PROVIDER=api
VITE_API_URL=https://api.yourdomain.com
```

**Backend Requirements:**
- Endpoints for media upload, download, delete
- Endpoints for book CRUD operations
- File system or database storage

### Option 2: S3 Storage (Recommended for Production)

Direct uploads to S3 using presigned URLs.

**Frontend:**
```javascript
// .env.production
VITE_STORAGE_PROVIDER=s3
VITE_S3_BUCKET=your-production-bucket
VITE_S3_REGION=us-east-1
VITE_S3_CDN_URL=https://cdn.yourdomain.com
```

**Backend Requirements:**
- AWS SDK configured
- Presigned URL generation
- S3 bucket with proper CORS configuration

**S3 CORS Configuration:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://app.yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Authentication Setup

### Google OAuth Configuration

#### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://app.yourdomain.com/auth/callback`
7. Copy Client ID and Client Secret

#### Step 2: Configure Environment

**Frontend (.env.production):**
```bash
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://app.yourdomain.com/auth/callback
```

**Backend (.env):**
```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
JWT_SECRET=your-very-secret-jwt-key
SESSION_SECRET=your-session-secret
```

---

## Environment Variables

### Frontend

Create `frontend/.env.production`:

```bash
# App
VITE_APP_ENV=production
VITE_APP_NAME=Ziner
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://app.yourdomain.com

# API
VITE_API_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000

# Storage
VITE_STORAGE_PROVIDER=s3
VITE_S3_BUCKET=your-production-bucket
VITE_S3_REGION=us-east-1
VITE_S3_CDN_URL=https://cdn.yourdomain.com

# Authentication
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://app.yourdomain.com/auth/callback
VITE_SESSION_TIMEOUT=3600000

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_MAX_UPLOAD_SIZE=10485760
```

### Backend

Create `server/.env`:

```bash
# Server
NODE_ENV=production
PORT=4876
CORS_ORIGIN=https://app.yourdomain.com

# Database
DATABASE_URL=mongodb://localhost:27017/ziner
# or
# DATABASE_URL=postgresql://user:password@localhost:5432/ziner

# Authentication
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
JWT_SECRET=your-very-secret-jwt-key-change-this
JWT_EXPIRY=24h
SESSION_SECRET=your-session-secret-change-this

# AWS S3 (if using S3 storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-production-bucket
S3_CDN_URL=https://cdn.yourdomain.com

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## Backend Implementation

### Required Endpoints

#### Authentication Endpoints

```javascript
// POST /auth/google
// Exchange Google auth code for JWT token
router.post('/auth/google', async (req, res) => {
  const { code } = req.body
  
  // Exchange code with Google
  const { tokens } = await oauth2Client.getToken(code)
  
  // Get user info from Google
  const userInfo = await getUserInfo(tokens.access_token)
  
  // Create or update user in database
  const user = await User.findOrCreate({
    googleId: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    role: 'user', // or 'admin' based on your logic
  })
  
  // Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
  
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
    expiresIn: 86400000, // 24 hours in ms
  })
})

// POST /auth/logout
router.post('/auth/logout', authenticateJWT, async (req, res) => {
  // Invalidate token (add to blacklist, etc.)
  res.json({ success: true })
})

// GET /auth/me
router.get('/auth/me', authenticateJWT, async (req, res) => {
  res.json({ user: req.user })
})
```

#### Media Endpoints

```javascript
// POST /media (Upload)
router.post('/media', authenticateJWT, upload.single('file'), async (req, res) => {
  const { file } = req
  const metadata = JSON.parse(req.body.metadata || '{}')
  
  // Upload to S3 or save locally
  const result = await storageService.uploadMedia(file, {
    ...metadata,
    userId: req.user.id,
  })
  
  res.json(result)
})

// GET /media (List)
router.get('/media', authenticateJWT, async (req, res) => {
  const userId = req.user.role === 'admin' ? req.query.userId : req.user.id
  const media = await Media.find({ userId })
  res.json(media)
})

// DELETE /media/:id
router.delete('/media/:id', authenticateJWT, async (req, res) => {
  const media = await Media.findById(req.params.id)
  
  // Check ownership or admin
  if (media.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  await storageService.deleteMedia(media.id)
  await media.remove()
  
  res.json({ success: true })
})
```

#### Book Endpoints

```javascript
// POST /books (Create/Update)
router.post('/books', authenticateJWT, async (req, res) => {
  const book = await Book.create({
    ...req.body,
    userId: req.user.id,
  })
  
  res.json(book)
})

// GET /books (List)
router.get('/books', authenticateJWT, async (req, res) => {
  const userId = req.user.role === 'admin' ? req.query.userId : req.user.id
  const books = await Book.find({ userId })
  res.json(books)
})

// GET /books/:id
router.get('/books/:id', authenticateJWT, async (req, res) => {
  const book = await Book.findById(req.params.id)
  
  // Check ownership or admin
  if (book.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  res.json(book)
})

// DELETE /books/:id
router.delete('/books/:id', authenticateJWT, async (req, res) => {
  const book = await Book.findById(req.params.id)
  
  // Check ownership or admin
  if (book.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  await book.remove()
  res.json({ success: true })
})
```

### Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken')

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  const token = authHeader.split(' ')[1] // Bearer TOKEN
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { authenticateJWT, requireAdmin }
```

---

## Deployment

### Frontend Deployment

#### Build for Production

```bash
cd frontend
npm run build
```

This creates a `dist/` folder with optimized static files.

#### Deploy to Vercel/Netlify

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

#### Deploy to Custom Server (Nginx)

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/ziner/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Backend Deployment

#### Using PM2 (Node.js Process Manager)

```bash
cd server
npm install -g pm2

# Start
pm2 start src/index.js --name ziner-api

# Monitor
pm2 logs ziner-api
pm2 status

# Auto-restart on server reboot
pm2 startup
pm2 save
```

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4876

CMD ["node", "src/index.js"]
```

```bash
# Build and run
docker build -t ziner-api .
docker run -d -p 4876:4876 --env-file .env ziner-api
```

---

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] CORS configured correctly
- [ ] JWT secret is strong and secret
- [ ] Environment variables secured (not committed to git)
- [ ] S3 bucket permissions configured (private, presigned URLs only)
- [ ] Rate limiting enabled on API
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] File upload size limits enforced
- [ ] XSS protection headers set
- [ ] CSP (Content Security Policy) configured

---

## Monitoring & Analytics

### Recommended Tools

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Lighthouse CI
- **Logs**: CloudWatch, Logtail

---

## Support

For issues or questions, contact: [your-email@domain.com]
