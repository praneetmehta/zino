# Railway Deployment Guide

**Platform**: Railway.app  
**Architecture**: Two services in one project  
**Date**: December 30, 2024

> **Note**: This is an **optional deployment guide** for Railway. The application is platform-agnostic and can be deployed to any hosting service (Vercel, Netlify, Heroku, AWS, etc.). This guide is provided as a convenience but is not required.

---

## 🚂 Overview

Deploy both frontend and backend as separate services within a single Railway project. This gives you:

- ✅ Both services in one project (easier management)
- ✅ Internal networking between services
- ✅ Separate scaling for frontend/backend
- ✅ Automatic SSL certificates
- ✅ Environment variable management
- ✅ Automatic deployments from Git

---

## 📋 Prerequisites

1. **Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub account

2. **GitHub Repository**
   - Push your code to GitHub
   - Repository should be public or Railway should have access

3. **Google OAuth** (Optional for production auth)
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `ziner` repository

### Step 2: Deploy Backend Service

**A. Create Backend Service**
1. In your project, click "New"
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will auto-detect and deploy

**B. Configure Backend Service**
1. Click on the service
2. Go to "Settings"
3. Set **Root Directory**: `server`
4. Set **Start Command**: `npm start`
5. Set **Health Check Path**: `/health`

**C. Set Backend Environment Variables**

Go to "Variables" tab and add:

```bash
# Required
NODE_ENV=production
PORT=${{PORT}}  # Railway auto-assigns
JWT_SECRET=your-random-64-char-secret-here

# CORS - Will be set after frontend is deployed
CORS_ORIGIN=https://your-frontend-url.railway.app

# Auth (if using Google OAuth)
SKIP_AUTH=false
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret

# Storage
STORAGE_PROVIDER=filesystem
JSON_BODY_LIMIT=150mb

# Optional: S3 (if using S3 storage)
# STORAGE_PROVIDER=s3
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# S3_BUCKET=your-bucket
# AWS_REGION=us-east-1
```

**Generate secrets:**
```bash
# JWT_SECRET (64 chars)
openssl rand -base64 48

# SESSION_SECRET (32 chars)
openssl rand -base64 24
```

**D. Get Backend URL**
1. Go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://ziner-backend.up.railway.app`)
4. Save this - you'll need it for frontend

### Step 3: Deploy Frontend Service

**A. Create Frontend Service**
1. Click "New" in your project
2. Select "GitHub Repo"
3. Choose same repository
4. Railway creates second service

**B. Configure Frontend Service**
1. Click on the service
2. Go to "Settings"
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npx vite preview --host 0.0.0.0 --port $PORT`

**C. Set Frontend Environment Variables**

Go to "Variables" tab and add:

```bash
# Required - Use backend URL from Step 2D
VITE_API_URL=https://your-backend-url.up.railway.app

# App Configuration
VITE_APP_ENV=production
VITE_APP_NAME=Ziner
VITE_APP_VERSION=2.0.0

# Auth
VITE_SKIP_AUTH=false

# Google OAuth (if using)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=https://your-frontend-url.railway.app/auth/callback

# Optional
VITE_ENABLE_DEBUG=false
VITE_MAX_UPLOAD_SIZE=10485760
```

**D. Get Frontend URL**
1. Go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://ziner.up.railway.app`)

### Step 4: Update Backend CORS

**Important:** Now that you have the frontend URL, update backend CORS:

1. Go to Backend service
2. Go to "Variables"
3. Update `CORS_ORIGIN` to your frontend URL:
   ```bash
   CORS_ORIGIN=https://your-frontend-url.railway.app
   ```
4. Service will auto-redeploy

### Step 5: Configure Google OAuth (If Using)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 Client
3. Add Authorized Redirect URIs:
   ```
   https://your-frontend-url.railway.app/auth/callback
   ```
4. Save

### Step 6: Test Deployment

1. Visit your frontend URL
2. Test basic functionality:
   - ✅ App loads
   - ✅ Can create a zine
   - ✅ Can save to library
   - ✅ Can load from library
   - ✅ Login works (if enabled)
   - ✅ PDF export works

---

## 🔧 Railway Configuration Files

Your repository includes these Railway-specific files:

```
ziner/
├── railway.json              # Root config
├── server/
│   ├── railway.json         # Backend config
│   └── nixpacks.toml        # Backend build config
└── frontend/
    └── railway.json         # Frontend config
```

These files tell Railway how to build and run each service.

---

## 📊 Project Structure in Railway

```
Ziner Project
├── Backend Service
│   ├── Domain: ziner-backend.up.railway.app
│   ├── Root: /server
│   ├── Port: Auto-assigned
│   └── Health: /health
│
└── Frontend Service
    ├── Domain: ziner.up.railway.app
    ├── Root: /frontend
    ├── Port: Auto-assigned
    └── Connects to: Backend service
```

---

## 🔄 Automatic Deployments

Railway automatically deploys on git push:

1. Push to `main` branch
2. Railway detects changes
3. Builds both services
4. Deploys automatically
5. Zero downtime

**Deploy specific service:**
- Changes in `server/` → Only backend redeploys
- Changes in `frontend/` → Only frontend redeploys
- Changes in root → Both redeploy

---

## 💰 Pricing & Resources

### Free Tier
- $5 credit/month
- Enough for development/testing
- Sleeps after inactivity

### Hobby Plan ($5/month)
- $5 credit/month included
- No sleeping
- Better for production

### Resource Allocation
**Backend:**
- Memory: 512MB - 1GB
- CPU: Shared
- Storage: 1GB (for uploads)

**Frontend:**
- Memory: 256MB - 512MB
- CPU: Shared
- Storage: Minimal

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check:**
1. Environment variables are set
2. `PORT` is set to `${{PORT}}`
3. Health check endpoint responds
4. Logs for errors: Service → "Deployments" → Click deployment → "View Logs"

**Common Issues:**
```bash
# Missing dependencies
npm ci  # Instead of npm install

# Wrong start command
npm start  # Not npm run dev

# Port not bound
app.listen(process.env.PORT || 4876, '0.0.0.0')  # Must bind to 0.0.0.0
```

### Frontend Won't Load

**Check:**
1. `VITE_API_URL` is correct backend URL
2. Build completed successfully
3. Start command is correct
4. Check build logs

**Common Issues:**
```bash
# Wrong API URL
VITE_API_URL=https://backend.railway.app  # Must be full URL with https://

# Build failed
# Check logs for error details

# Port binding
# Must use: --host 0.0.0.0 --port $PORT
```

### CORS Errors

**Symptoms:**
- Frontend loads but API calls fail
- Console shows CORS errors

**Fix:**
1. Backend `CORS_ORIGIN` must match frontend URL exactly
2. Include `https://` in URL
3. No trailing slash
4. Redeploy backend after changing

**Correct:**
```bash
CORS_ORIGIN=https://ziner.up.railway.app
```

**Incorrect:**
```bash
CORS_ORIGIN=ziner.up.railway.app  # Missing https://
CORS_ORIGIN=https://ziner.up.railway.app/  # Trailing slash
```

### Auth Not Working

**Check:**
1. Google OAuth redirect URI matches frontend URL
2. `VITE_GOOGLE_CLIENT_ID` is set on frontend
3. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set on backend
4. `SKIP_AUTH=false` on both
5. `JWT_SECRET` is set on backend

### Database/Storage Issues

**Filesystem Storage:**
- Works but data lost on redeploy
- Use Railway Volumes for persistence

**Add Volume (Persistent Storage):**
1. Go to Backend service
2. Click "New" → "Volume"
3. Mount path: `/app/data`
4. Data persists across deployments

**S3 Storage (Recommended for Production):**
1. Set `STORAGE_PROVIDER=s3`
2. Add AWS credentials
3. No volume needed

---

## 📈 Monitoring

### View Logs
1. Go to service
2. Click "Deployments"
3. Click active deployment
4. "View Logs"

### Metrics
1. Service → "Metrics"
2. See:
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

### Alerts
1. Service → "Settings" → "Webhooks"
2. Configure alerts for:
   - Deploy failures
   - Service crashes
   - High resource usage

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong, random secrets
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/prod

### CORS
- ✅ Set specific origins (not *)
- ✅ Update when frontend URL changes
- ✅ Test CORS in production

### Auth
- ✅ Use strong JWT secrets
- ✅ Enable HTTPS only (Railway does this automatically)
- ✅ Set proper OAuth redirect URIs
- ✅ Validate tokens on every request

---

## 🚀 Going Live Checklist

### Before Launch
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and loads
- [ ] CORS configured correctly
- [ ] Google OAuth configured (if using)
- [ ] Environment variables verified
- [ ] Test all core features
- [ ] Check logs for errors
- [ ] Performance test with real data

### After Launch
- [ ] Monitor logs for errors
- [ ] Check resource usage
- [ ] Set up alerts
- [ ] Document any issues
- [ ] Plan for scaling if needed

---

## 🎯 Quick Reference

### URLs After Deployment
```bash
# Frontend (users visit)
https://ziner.up.railway.app

# Backend (internal API)
https://ziner-backend.up.railway.app

# Health check
https://ziner-backend.up.railway.app/health
```

### Key Environment Variables

**Backend Must-Haves:**
```bash
NODE_ENV=production
PORT=${{PORT}}
JWT_SECRET=<random-64-chars>
CORS_ORIGIN=<frontend-url>
```

**Frontend Must-Haves:**
```bash
VITE_API_URL=<backend-url>
VITE_APP_ENV=production
```

### Redeploy Services
```bash
# Via Git
git push origin main

# Via Railway CLI
railway up

# Manual (in Railway dashboard)
Service → Deployments → "Deploy"
```

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Nixpacks Docs**: https://nixpacks.com
- **Railway CLI**: https://docs.railway.app/develop/cli

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Frontend loads at Railway URL
- ✅ Backend health check returns 200
- ✅ Can create and save zines
- ✅ Authentication works (if enabled)
- ✅ No CORS errors in console
- ✅ PDF export works
- ✅ No errors in Railway logs

---

**Happy deploying!** 🚂✨

Need help? Check Railway logs first, then consult this guide's troubleshooting section.
