# Railway PostgreSQL Deployment Guide

**Deploy Ziner with PostgreSQL on Railway**

---

## 🚂 Railway Overview

Railway provides:
- ✅ **Free PostgreSQL database** (500MB)
- ✅ **Auto-scaling backend**
- ✅ **Environment variables**
- ✅ **Automatic SSL/HTTPS**
- ✅ **GitHub integration**

---

## 📋 Step-by-Step Deployment

### Part 1: Set Up Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Login with GitHub (recommended)

---

### Part 2: Create PostgreSQL Database

#### Option A: Empty Project (Manual Setup)

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy PostgreSQL"
   - Railway provisions database (takes ~30 seconds)

2. **Get Database Credentials**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - You'll see these variables:
     ```
     DATABASE_URL=postgresql://postgres:pass@region.railway.app:5432/railway
     PGHOST=region.railway.app
     PGPORT=5432
     PGUSER=postgres
     PGPASSWORD=your-password
     PGDATABASE=railway
     ```

3. **Copy `DATABASE_URL`**
   - This is what you'll use in your backend
   - Format: `postgresql://user:password@host:port/database`

#### Option B: Deploy from GitHub (Recommended)

1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `ziner` repository
   - Railway auto-detects it's a Node.js app

2. **Add PostgreSQL to Project**
   - In your project dashboard
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway creates database in same project

3. **Link Database to Backend**
   - Railway automatically exposes `DATABASE_URL` to your backend service
   - No manual configuration needed!

---

### Part 3: Configure Backend Service

#### 1. Set Environment Variables

Click on your **backend service** → "Variables" tab

**Add these variables:**

```bash
# Node Environment
NODE_ENV=production

# Port (Railway provides this automatically, but you can set it)
PORT=4876

# Database (Already set by Railway if you added PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://your-frontend-url.railway.app

# JWT Security
JWT_SECRET=<generate-random-string-64-chars>
JWT_EXPIRY=24h

# CORS (Allow your frontend)
CORS_ORIGIN=https://your-frontend-url.railway.app

# Storage
STORAGE_PROVIDER=filesystem
# Or use S3 for production (recommended)
# STORAGE_PROVIDER=s3
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# S3_BUCKET=...

# JSON limit
JSON_BODY_LIMIT=150mb

# Auth
SKIP_AUTH=false
```

**🔧 Railway Variable Reference:**
- `${{Postgres.DATABASE_URL}}` - Auto-references your PostgreSQL service
- Railway auto-injects this when you add PostgreSQL to project

#### 2. Generate Secure JWT Secret

```bash
# Run locally to generate
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use this online (secure)
openssl rand -hex 64
```

Copy the output and paste as `JWT_SECRET` value.

---

### Part 4: Configure Frontend Service

#### 1. Add Frontend to Railway

**If not already added:**
- In your project, click "New" → "GitHub Repo"
- Select your repo again
- Railway detects both `frontend/` and `server/`

**Or create separate project for frontend** (recommended for static hosting):
- Deploy frontend to Vercel/Netlify instead
- Better performance for static assets

#### 2. Set Frontend Environment Variables

Click **frontend service** → "Variables" tab:

```bash
NODE_ENV=production

# Backend API URL (from your backend Railway deployment)
VITE_API_URL=https://your-backend.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Auth
VITE_SKIP_AUTH=false
```

---

### Part 5: Update Google OAuth for Production

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**

2. **Navigate to Credentials**
   - APIs & Services → Credentials
   - Click your OAuth Client ID

3. **Add Railway URLs to Authorized Origins**
   ```
   https://your-backend.railway.app
   https://your-frontend.railway.app
   ```

4. **Add Railway URLs to Authorized Redirect URIs**
   ```
   https://your-frontend.railway.app
   https://your-frontend.railway.app/auth/callback
   ```

5. **Update Environment Variables**
   - Go back to Railway → Backend Variables
   - Update `GOOGLE_REDIRECT_URI` to your Railway frontend URL

---

### Part 6: Deploy

#### Automatic Deployment (Recommended)

Railway auto-deploys when you:
1. Push to GitHub main/master branch
2. Railway detects changes
3. Builds and deploys automatically

**Push your code:**
```bash
git add .
git commit -m "Add PostgreSQL and Google OAuth"
git push origin main
```

Railway will:
1. ✅ Build your backend
2. ✅ Start server on Railway
3. ✅ Connect to PostgreSQL automatically
4. ✅ Initialize database schema
5. ✅ Expose public URL

#### Manual Deployment

If Railway doesn't auto-deploy:
1. Go to your service
2. Click "Settings" → "Deploy"
3. Click "Deploy Now"

---

### Part 7: Verify Database Connection

#### Check Deployment Logs

1. Click your **backend service**
2. Go to "Deployments" tab
3. Click latest deployment
4. View logs

**Look for:**
```
✅ Database connected successfully
✅ Database schema initialized
✅ Google OAuth initialized
📚 Zino backend listening on http://0.0.0.0:4876
   Database: ✅ Connected
   Google OAuth: ✅ Configured
```

#### Connect to Railway PostgreSQL

**Option A: Railway Dashboard**
1. Click PostgreSQL service
2. Go to "Data" tab
3. Browse/query data in browser

**Option B: Local psql Client**
```bash
# Get connection string from Railway
# PostgreSQL service → Variables → DATABASE_URL

# Connect
psql "postgresql://postgres:pass@region.railway.app:5432/railway"

# List tables
\dt

# Query users
SELECT * FROM users;
```

**Option C: GUI Tools (TablePlus, pgAdmin)**
1. Open your SQL client
2. Create new connection:
   - **Host**: `region.railway.app`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (from Railway variables)
   - **Database**: `railway`
   - **SSL**: Enabled

---

### Part 8: Test Production Login

1. **Open your Railway frontend URL**
   - `https://your-frontend.railway.app/zino`

2. **Click "Sign In"**

3. **Sign in with Google**

4. **Check Database**
   - Go to Railway → PostgreSQL → Data tab
   - Click `users` table
   - Should see your user record!

---

## 🔧 Railway Configuration Files

### railway.toml (Optional - Advanced)

Create `server/railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[healthcheck]
path = "/health"
timeout = 100
interval = 60
```

### Root Detection

If Railway doesn't detect your app correctly:

**Create `railway.json` in root:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 💰 Railway Pricing & Limits

### Free Tier (Hobby)
- ✅ $5 free credit per month
- ✅ PostgreSQL: 500MB storage
- ✅ Backend: Sleeps after inactivity
- ✅ Unlimited bandwidth
- ✅ Custom domains

### Usage Tips
- PostgreSQL uses ~$1-2/month
- Backend uses ~$3-5/month (if always running)
- Keep under $5/month for free

### Prevent Sleep (Optional)
Use a service like **UptimeRobot** to ping your backend every 5 minutes:
- Free tier on uptimerobot.com
- Keeps Railway backend awake

---

## 🔒 Production Security Checklist

### Environment Variables
- [ ] `JWT_SECRET` is strong random string (64+ chars)
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` uses SSL (Railway does this automatically)
- [ ] `GOOGLE_CLIENT_SECRET` not exposed in frontend
- [ ] `CORS_ORIGIN` set to specific domain (not `*`)

### Database
- [ ] SSL enabled (Railway default)
- [ ] Regular backups (Railway Pro feature)
- [ ] Connection pooling configured (already done in code)

### Authentication
- [ ] `SKIP_AUTH=false` in production
- [ ] Google OAuth redirect URIs match exactly
- [ ] JWT tokens expire (24h default)
- [ ] HTTPS only (Railway default)

### Monitoring
- [ ] Check Railway logs regularly
- [ ] Set up health check endpoint (`/health`)
- [ ] Monitor database size (500MB limit)

---

## 📊 Monitoring & Debugging

### View Backend Logs

```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway logs
```

**Or use Railway Dashboard:**
1. Click backend service
2. "Deployments" → Latest deployment
3. View real-time logs

### Common Deployment Issues

#### Database Connection Failed

**Error in logs:** `Database connection failed`

**Fix:**
1. Check PostgreSQL service is running (Railway dashboard)
2. Verify `DATABASE_URL` is set in backend variables
3. Check if using `${{Postgres.DATABASE_URL}}` reference
4. Restart backend service

#### OAuth Redirect Mismatch

**Error:** `redirect_uri_mismatch`

**Fix:**
1. Go to Google Cloud Console
2. Add exact Railway frontend URL to authorized URIs
3. Ensure `GOOGLE_REDIRECT_URI` matches in backend variables
4. No trailing slashes!

#### App Not Starting

**Error:** Build succeeds but app doesn't start

**Fix:**
1. Check `package.json` has correct `start` script
2. Verify `PORT` environment variable
3. Check logs for error messages
4. Ensure `NODE_ENV=production`

---

## 🚀 Advanced: Multi-Environment Setup

### Staging + Production

**Create two Railway projects:**

#### 1. Staging Project
```bash
# Branch: develop
DATABASE_URL -> staging-postgres
GOOGLE_REDIRECT_URI -> https://staging.yourdomain.com
```

#### 2. Production Project
```bash
# Branch: main
DATABASE_URL -> production-postgres
GOOGLE_REDIRECT_URI -> https://yourdomain.com
```

Railway can deploy different branches to different projects!

---

## 🎯 Quick Reference

### Get Railway URLs

**Backend URL:**
- Railway → Backend service → "Settings" → "Domains"
- Usually: `https://your-backend.railway.app`

**Frontend URL:**
- Railway → Frontend service → "Settings" → "Domains"
- Usually: `https://your-frontend.railway.app`

**PostgreSQL Host:**
- Railway → PostgreSQL → "Variables" → `PGHOST`
- Usually: `region.railway.app`

### Update Environment Variables

```bash
# Railway Dashboard
Project → Service → Variables → Edit

# Or use Railway CLI
railway variables set VARIABLE_NAME=value
```

### Manual Redeploy

```bash
# Railway Dashboard
Service → Settings → Redeploy

# Or trigger via git push
git commit --allow-empty -m "Redeploy"
git push origin main
```

---

## 📖 Complete Deployment Workflow

```bash
# 1. Create Railway account
# 2. Create new project
# 3. Deploy from GitHub
# 4. Add PostgreSQL to project
# 5. Set environment variables in Railway dashboard:

NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-frontend.railway.app
JWT_SECRET=...
CORS_ORIGIN=https://your-frontend.railway.app
SKIP_AUTH=false

# 6. Update Google OAuth Console with Railway URLs
# 7. Deploy (automatic on git push)
# 8. Test login flow
# 9. Verify user in PostgreSQL Data tab
# 10. ✅ Done!
```

---

## 🎓 Database Management

### View Data in Railway

1. PostgreSQL service → "Data" tab
2. Click table (e.g., `users`)
3. View/edit records in browser

### Backup Database

**Railway Dashboard:**
- PostgreSQL service → "Backups" tab
- Click "Create Backup"
- (Pro feature - $20/month)

**Manual Backup:**
```bash
# Get DATABASE_URL from Railway
pg_dump "postgresql://postgres:pass@region.railway.app:5432/railway" > backup.sql

# Restore
psql "postgresql://postgres:pass@region.railway.app:5432/railway" < backup.sql
```

### Reset Database

**Careful - this deletes all data!**

```bash
# Connect to Railway PostgreSQL
psql $DATABASE_URL

# Drop users table
DROP TABLE users;

# Schema will auto-recreate on next server restart
```

---

## ✅ Success Checklist

Deployment is successful when:

- [ ] Railway shows "Deployed" status (green)
- [ ] Backend logs show "Database: ✅ Connected"
- [ ] Backend logs show "Google OAuth: ✅ Configured"
- [ ] Frontend loads at Railway URL
- [ ] "Sign In" button appears
- [ ] Google OAuth popup works
- [ ] User gets logged in
- [ ] User record appears in PostgreSQL Data tab
- [ ] Logout works
- [ ] Second login doesn't create duplicate user

---

## 🆘 Support

**Railway Documentation:**
- https://docs.railway.app
- PostgreSQL: https://docs.railway.app/databases/postgresql

**Railway Discord:**
- https://discord.gg/railway
- Active community support

**Your Documentation:**
- `GOOGLE_OAUTH_SETUP.md` - OAuth setup details
- `OAUTH_QUICKSTART.md` - Local development
- `OAUTH_IMPLEMENTATION_SUMMARY.md` - Technical overview

---

**🎉 Your Ziner app is now live on Railway with PostgreSQL!**

**Next:** Set up custom domain, monitoring, and backups.
