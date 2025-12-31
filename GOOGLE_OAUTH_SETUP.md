# Google OAuth Setup Guide

**Complete guide to enable Google OAuth authentication with PostgreSQL user storage**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [PostgreSQL Setup](#postgresql-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ Node.js installed  
✅ Google account for OAuth setup  
✅ PostgreSQL database (local or hosted)

---

## PostgreSQL Setup

### Option 1: Railway (Recommended for Production)

**Railway provides free PostgreSQL hosting:**

1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Click "New" → "Database" → "PostgreSQL"
4. Railway will provision the database
5. Click the database → "Variables" tab
6. Copy the `DATABASE_URL` (looks like: `postgresql://user:pass@host:5432/railway`)

**Cost**: Free tier includes 500MB storage

### Option 2: Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to "Settings" → "Database"
4. Copy the "Connection string" under "Connection pooling"

**Cost**: Free tier includes 500MB storage

### Option 3: Local PostgreSQL

**Install PostgreSQL locally:**

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Create database:**
```bash
# Create user
createuser -s zino_user -P
# Enter password when prompted

# Create database
createdb -O zino_user zino_db
```

**Connection string:**
```
postgresql://zino_user:your_password@localhost:5432/zino_db
```

### Option 4: Docker PostgreSQL

```bash
docker run --name zino-postgres \
  -e POSTGRES_USER=zino_user \
  -e POSTGRES_PASSWORD=zino_password \
  -e POSTGRES_DB=zino_db \
  -p 5432:5432 \
  -d postgres:16
```

**Connection string:**
```
postgresql://zino_user:zino_password@localhost:5432/zino_db
```

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown → "New Project"
3. Name it "Ziner" (or your preferred name)
4. Click "Create"

### 2. Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Click "Create"

**Fill in the form:**
- **App name**: Ziner
- **User support email**: Your email
- **Developer contact**: Your email
- **App logo**: (optional)
- **Authorized domains**: 
  - For production: `yourdomain.com`
  - For local: Leave empty

4. Click "Save and Continue"
5. **Scopes**: Click "Add or Remove Scopes"
   - Select: `openid`, `email`, `profile`
   - Click "Update" → "Save and Continue"
6. **Test users** (for development):
   - Add your Gmail address
   - Click "Save and Continue"
7. Click "Back to Dashboard"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"

**Configure:**
- **Name**: Ziner Web Client
- **Authorized JavaScript origins**:
  - Development: `http://localhost:5173`
  - Production: `https://yourdomain.com`
- **Authorized redirect URIs**:
  - Development: `http://localhost:5173` (leave as-is, OAuth happens in popup)
  - Production: `https://yourdomain.com`

4. Click "Create"
5. **Copy your credentials:**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123xyz...`

⚠️ **Keep these secret!**

---

## Environment Configuration

### Backend Configuration

Edit `server/.env` (or create from `.env.example`):

```bash
# ======================
# Database
# ======================
DATABASE_URL=postgresql://user:password@host:5432/database

# ======================
# Authentication
# ======================
# Disable dev mode auth bypass for production
SKIP_AUTH=false

# Google OAuth Credentials
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz...
GOOGLE_REDIRECT_URI=http://localhost:5173

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=24h
```

### Frontend Configuration

Edit `frontend/.env.development`:

```bash
# Backend API
VITE_API_URL=http://localhost:4876

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_SKIP_AUTH=false
```

For production, edit `frontend/.env.production`:

```bash
# Backend API
VITE_API_URL=https://your-api.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_SKIP_AUTH=false
```

---

## Testing

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```

**Look for these logs:**
```
✅ Database connected successfully
✅ Database schema initialized
✅ Google OAuth initialized
📚 Zino backend listening on http://0.0.0.0:4876
   Database: ✅ Connected
   Google OAuth: ✅ Configured
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Authentication Flow

1. Open http://localhost:5173
2. Click "Sign In" button
3. Google OAuth popup should appear
4. Sign in with your Google account
5. Authorize the app
6. You should be redirected back and logged in
7. Your profile should show in the header

### 4. Verify Database

**Check if user was saved:**

```bash
# Connect to your database
psql postgresql://user:password@host:5432/database

# Query users
SELECT id, email, name, role, created_at FROM users;
```

You should see your user record!

---

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed`

**Solutions:**
- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure database server is running
- ✅ Check firewall allows connection
- ✅ For Railway/Supabase: Check service is active

### Google OAuth Error: redirect_uri_mismatch

**Error:** `redirect_uri_mismatch`

**Solutions:**
- ✅ Add exact URL to Google Console → Credentials → Authorized redirect URIs
- ✅ URLs must match exactly (including http vs https)
- ✅ For localhost, use `http://localhost:5173` (not 127.0.0.1)

### Token Not Working

**Error:** `Invalid token` or `Token expired`

**Solutions:**
- ✅ Check `JWT_SECRET` is set in backend `.env`
- ✅ Frontend and backend must use same API URL
- ✅ Clear browser localStorage and try again
- ✅ Check browser console for errors

### User Not Found in Database

**Error:** User can log in but data not persisted

**Solutions:**
- ✅ Check database connection is successful
- ✅ Verify `users` table was created
- ✅ Check backend logs for database errors
- ✅ Run schema initialization manually

**Manual schema initialization:**
```sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

### Development Mode Still Active

**Issue:** Mock login instead of real Google OAuth

**Solutions:**
- ✅ Set `SKIP_AUTH=false` in backend `.env`
- ✅ Set `VITE_SKIP_AUTH=false` in frontend `.env`
- ✅ Restart both servers
- ✅ Clear browser cache/localStorage

---

## Security Best Practices

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use HTTPS in production (not HTTP)
- [ ] Never commit `.env` files to git
- [ ] Use environment variables in CI/CD
- [ ] Enable PostgreSQL SSL in production
- [ ] Set `NODE_ENV=production`
- [ ] Review Google OAuth scopes (minimal required)
- [ ] Add rate limiting to auth endpoints
- [ ] Monitor failed login attempts
- [ ] Implement token refresh mechanism

### Generate Secure JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

---

## Database Schema Reference

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(255) | Unique user ID (auto-generated) |
| `google_id` | VARCHAR(255) | Google's unique user ID |
| `email` | VARCHAR(255) | User's email from Google |
| `name` | VARCHAR(255) | User's display name |
| `avatar` | VARCHAR(500) | Profile picture URL |
| `role` | VARCHAR(50) | User role: 'user' or 'admin' |
| `created_at` | TIMESTAMP | Account creation time |
| `last_login_at` | TIMESTAMP | Last login timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Indexes

- Primary key on `id`
- Unique index on `google_id`
- Unique index on `email`
- Index on `google_id` for fast lookups
- Index on `email` for fast lookups

---

## Next Steps

Once authentication is working:

1. **User Profiles**: Add profile editing UI
2. **Admin Panel**: Create admin dashboard
3. **User Management**: Add user list/management for admins
4. **Session Management**: Implement token refresh
5. **Analytics**: Track user activity
6. **Permissions**: Fine-grained access control

---

## Support

**Having issues?** Check:
- Backend logs (`npm run dev` output)
- Browser console (F12)
- Database connection
- Google Cloud Console quota/errors

**Need help?** Common issues are covered in the Troubleshooting section above.

---

**✅ You're all set! Your app now has production-ready authentication with PostgreSQL user storage.**
