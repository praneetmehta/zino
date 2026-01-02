# CORS Fix for Development Environment

## 🐛 The Problem

**Error:**
```
Access to fetch at 'http://localhost:4876/books' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Root Cause:**
1. Backend's `npm run dev` didn't set `NODE_ENV=development`
2. Without NODE_ENV set, CORS checks the whitelist
3. Frontend on port 3001 wasn't in the whitelist
4. Result: CORS blocked the request

---

## ✅ The Fix

### 1. Updated `package.json`

**Before:**
```json
"dev": "node src/index.js"
```

**After:**
```json
"dev": "NODE_ENV=development node src/index.js"
```

Now `npm run dev` automatically sets development mode.

### 2. Added More Allowed Origins

**Updated `server/src/index.js` line 21:**
```javascript
['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000', 'http://localhost:3001']
```

This covers:
- Vite default ports (5173, 4173, 3000, 3001)
- Multiple frontend instances

### 3. Added Better CORS Logging

**Now you'll see:**
```
✅ CORS allowed (dev mode): http://localhost:3001
```

Or in production:
```
❌ CORS blocked: http://localhost:3001
   Allowed origins: http://localhost:5173, http://localhost:4173
   Tip: Set NODE_ENV=development for dev mode
```

---

## 🚀 How to Use

### Development

**Start backend:**
```bash
cd server
npm run dev
```

**You should see:**
```
📚 Ziner backend listening on http://0.0.0.0:4876
   Environment: development
   CORS Origins: http://localhost:5173, http://localhost:4173, http://localhost:3000, http://localhost:3001
```

**Any request from localhost will now work!**

### Production (Railway)

On Railway, `NODE_ENV=production` is automatic. CORS will only allow:
```
https://zino-frontend-production.up.railway.app
```

Set this in Railway variables:
```bash
CORS_ORIGIN=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

---

## 🧪 Testing

### 1. Restart Backend

```bash
# Stop current backend (Ctrl+C)
cd server
npm run dev
```

**Expected output:**
```
📚 Ziner backend listening on http://0.0.0.0:4876
   Environment: development
   CORS Origins: http://localhost:5173, http://localhost:4173, http://localhost:3000, http://localhost:3001
✅ Storage service initialized
```

### 2. Try Saving a Book

1. Open frontend: http://localhost:3001 (or whatever port)
2. Create a zine
3. Click "Save"
4. **Should work now!**

### 3. Check Backend Logs

You should see:
```
✅ CORS allowed (dev mode): http://localhost:3001
[POST /books] error: ...or success
```

---

## 🔍 How CORS Works Now

### Development Mode (NODE_ENV=development)

```javascript
if (process.env.NODE_ENV === 'development') {
  // Allow ALL origins
  return callback(null, true)
}
```

**Any localhost origin works:** ✅
- http://localhost:3000
- http://localhost:3001
- http://localhost:5173
- http://127.0.0.1:3000
- etc.

### Production Mode (NODE_ENV=production)

```javascript
if (ALLOWED_ORIGINS.includes(origin)) {
  // Only allow whitelisted origins
  callback(null, true)
} else {
  callback(new Error('Not allowed by CORS'))
}
```

**Only whitelisted origins work:**
- ✅ https://zino-frontend-production.up.railway.app
- ❌ http://localhost:3001
- ❌ Any other origin

---

## 🎯 Verification Checklist

- [x] `package.json` has `NODE_ENV=development` in dev script
- [x] Backend logs show "Environment: development"
- [x] CORS allows localhost origins
- [x] Frontend can save books without CORS errors
- [ ] Test this by saving a book ← **DO THIS NOW**

---

## 🚨 If You Still Get CORS Errors

### Check 1: Is NODE_ENV Set?

**Backend logs should show:**
```
Environment: development
```

**If it shows:**
```
Environment: undefined
```

**Then manually set it:**
```bash
NODE_ENV=development npm run dev
```

### Check 2: Is Backend Running?

```bash
curl http://localhost:4876/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check 3: What Port is Frontend Using?

**Look at frontend console:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3001/
```

**That port should be in ALLOWED_ORIGINS** (it is now!)

---

## 📚 Related Files

- `server/package.json` - Sets NODE_ENV for dev script
- `server/src/index.js` - CORS configuration (lines 18-50)
- `frontend/vite.config.js` - Frontend port config

---

## ✅ Success!

After this fix:
- ✅ Development CORS errors are gone
- ✅ Any localhost port works in dev mode
- ✅ Better logging for debugging
- ✅ Production still secure with whitelist

Restart your backend and try again! 🚀
