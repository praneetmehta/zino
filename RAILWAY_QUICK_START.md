# Railway Quick Start - TL;DR

**Deploy Ziner to Railway in 10 minutes** 🚂

> **Note**: This is an **optional guide** for Railway deployment. Ziner is platform-agnostic and works with any hosting provider. Choose the platform that works best for you.

---

## ⚡ Super Quick Deploy

### 1. Create Project (1 min)
```
1. Go to railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your ziner repo
```

### 2. Backend Service (3 min)
```
Settings:
- Root Directory: server
- Start Command: npm start
- Health Check: /health

Variables (minimum):
NODE_ENV=production
PORT=${{PORT}}
JWT_SECRET=$(openssl rand -base64 48)
CORS_ORIGIN=http://localhost:5173  # Update after frontend deploy

Generate Domain → Copy backend URL
```

### 3. Frontend Service (3 min)
```
New Service → Same repo

Settings:
- Root Directory: frontend
- Build: npm install && npm run build
- Start: npx vite preview --host 0.0.0.0 --port $PORT

Variables (minimum):
VITE_API_URL=https://your-backend-url.railway.app
VITE_APP_ENV=production
VITE_SKIP_AUTH=true  # Skip auth for now

Generate Domain → Copy frontend URL
```

### 4. Update CORS (1 min)
```
Go to Backend → Variables
Update: CORS_ORIGIN=https://your-frontend-url.railway.app
```

### 5. Test (2 min)
```
Visit frontend URL
- Should load ✅
- Create a zine ✅
- Save to library ✅
- Reload page ✅
- Load from library ✅
```

---

## 🎯 Deployed!

**Your URLs:**
- Frontend: `https://ziner-production.up.railway.app`
- Backend: `https://ziner-backend-production.up.railway.app`

---

## 🔐 Optional: Enable Real Auth

### 1. Google OAuth (5 min)
```
1. Go to console.cloud.google.com
2. Create OAuth 2.0 Client
3. Add redirect: https://your-frontend.railway.app/auth/callback
4. Copy Client ID & Secret
```

### 2. Update Variables
```
Backend:
- SKIP_AUTH=false
- GOOGLE_CLIENT_ID=your-id
- GOOGLE_CLIENT_SECRET=your-secret
- SESSION_SECRET=$(openssl rand -base64 24)

Frontend:
- VITE_SKIP_AUTH=false
- VITE_GOOGLE_CLIENT_ID=your-id
```

### 3. Test Login
```
Visit your app → Click "Sign In" → Google popup → Login!
```

---

## 📊 Project Structure

```
Railway Project: Ziner
│
├── Backend Service
│   URL: ziner-backend.up.railway.app
│   Repo: /server
│   Env: 4 variables minimum
│
└── Frontend Service
    URL: ziner.up.railway.app
    Repo: /frontend
    Env: 3 variables minimum
```

---

## 🐛 Quick Fixes

### Backend won't start?
```bash
# Check logs: Service → Deployments → View Logs

# Common fix:
PORT=${{PORT}}  # Must use Railway's port variable
```

### Frontend can't reach backend?
```bash
# Check VITE_API_URL includes https://
VITE_API_URL=https://backend.railway.app  # ✅
VITE_API_URL=backend.railway.app  # ❌
```

### CORS errors?
```bash
# Backend CORS_ORIGIN must exactly match frontend URL
CORS_ORIGIN=https://ziner.railway.app  # ✅
CORS_ORIGIN=https://ziner.railway.app/  # ❌ (trailing slash)
```

---

## 📝 Environment Variables Cheat Sheet

### Backend (Required)
```bash
NODE_ENV=production
PORT=${{PORT}}
JWT_SECRET=<64 random chars>
CORS_ORIGIN=<frontend-url>
```

### Frontend (Required)
```bash
VITE_API_URL=<backend-url>
VITE_APP_ENV=production
VITE_SKIP_AUTH=true
```

### Generate Secrets
```bash
# JWT Secret
openssl rand -base64 48

# Session Secret
openssl rand -base64 24
```

---

## 🚀 Deploy Updates

```bash
# Push to GitHub
git add .
git commit -m "Update"
git push

# Railway auto-deploys!
# Watch: Project → Deployments
```

---

## ✅ Success Checklist

- [x] Backend service deployed
- [x] Frontend service deployed
- [x] CORS configured
- [x] Frontend can load
- [x] Can create zines
- [x] Can save/load
- [x] No errors in logs

---

## 📚 Full Guide

For detailed instructions: See `RAILWAY_DEPLOYMENT.md`

---

**That's it! You're live on Railway!** 🎉

Your app is now:
- ✅ Deployed
- ✅ Auto-scaling
- ✅ Auto-SSL
- ✅ Auto-deploying on push
- ✅ Production-ready

Enjoy! 🚂✨
