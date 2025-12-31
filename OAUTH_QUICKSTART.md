# Google OAuth Quick Start

**Get authentication working in 10 minutes**

---

## 🚀 Quick Setup

### 1. Set Up PostgreSQL (Choose One)

**Option A: Railway (Easiest)**
```bash
# 1. Go to railway.app and create account
# 2. New Project → Add PostgreSQL
# 3. Copy DATABASE_URL from Variables tab
```

**Option B: Local Docker**
```bash
docker run --name zino-db \
  -e POSTGRES_PASSWORD=zino123 \
  -e POSTGRES_DB=zino \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Get Google OAuth Credentials

1. **Go to**: https://console.cloud.google.com
2. **Create project** → Name it "Ziner"
3. **Enable API**: APIs & Services → Library → "Google+ API" → Enable
4. **OAuth Screen**: APIs & Services → OAuth consent screen
   - External → Create
   - App name: "Ziner"
   - Add your email
   - Save
5. **Create Credentials**: APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Web application
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173`
   - Create
6. **Copy** Client ID and Client Secret

### 3. Configure Backend

Create `server/.env`:

```bash
# Database (from Railway or local)
DATABASE_URL=postgresql://user:password@host:5432/zino

# Google OAuth (from step 2)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REDIRECT_URI=http://localhost:5173

# Security
JWT_SECRET=change-this-to-random-string
SKIP_AUTH=false

# Other settings
NODE_ENV=development
PORT=4876
CORS_ORIGIN=http://localhost:5173
STORAGE_PROVIDER=filesystem
```

### 4. Configure Frontend

Edit `frontend/.env.development`:

```bash
VITE_API_URL=http://localhost:4876
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_SKIP_AUTH=false
```

### 5. Start Services

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Look for:**
```
✅ Database connected successfully
✅ Google OAuth initialized
📚 Zino backend listening on http://0.0.0.0:4876
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Test Login

1. Open http://localhost:5173
2. Click "Sign In"
3. Sign in with Google
4. ✅ You're logged in!

---

## 📊 Verify It Works

**Check database:**
```bash
# Connect to your database
psql $DATABASE_URL

# View users
SELECT email, name, role FROM users;
```

**Check user in app:**
- Click your avatar in header
- Should show your Google name/email
- Profile dropdown should work

---

## 🐛 Common Issues

### "Database not configured"
- Check `DATABASE_URL` in `server/.env`
- Ensure database server is running
- Test connection: `psql $DATABASE_URL`

### "redirect_uri_mismatch"
- Add `http://localhost:5173` to Google Console authorized URIs
- Must be exact match (no trailing slash)

### Still seeing "Development Mode"
- Check `SKIP_AUTH=false` in both `.env` files
- Restart both servers
- Clear browser localStorage

---

## 📖 Full Documentation

For detailed setup, troubleshooting, and production deployment:
- See **GOOGLE_OAUTH_SETUP.md**

---

## ✅ Next Steps

Once working:
- [ ] Test with different Google accounts
- [ ] Check user is saved in database
- [ ] Try logout and login again
- [ ] Deploy to production (see GOOGLE_OAUTH_SETUP.md)

---

**That's it! You now have Google OAuth working with PostgreSQL.** 🎉
