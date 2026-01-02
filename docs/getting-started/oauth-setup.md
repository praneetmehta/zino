# OAuth Setup Guide

Configure Google OAuth for user authentication in Zino.

## Overview

Zino uses Google OAuth 2.0 for user authentication with:
- **Google One Tap** - Quick sign-in popup
- **Standard OAuth Flow** - Fallback for compatibility
- **JWT Tokens** - Secure session management

## Prerequisites

- Google Cloud Platform account
- Project deployed or running locally

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: "Zino" (or your app name)
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: Zino
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
4. Click "Save and Continue"
5. **Scopes**: Add these scopes:
   - `openid`
   - `email`
   - `profile`
6. Click "Save and Continue"
7. **Test users** (for development):
   - Add your email and test users
8. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Configure:

   **Name**: Zino Web Client

   **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

   **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

5. Click "Create"
6. **Save your credentials**:
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxx`

## Step 5: Configure Backend

Add to `server/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session expiry (optional)
JWT_EXPIRY=24h
```

### Generate Strong JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Step 6: Configure Frontend

Add to `frontend/.env.development` (local):

```env
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_APP_URL=http://localhost:3000
```

Add to `frontend/.env.production` (or Railway variables):

```env
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback
VITE_APP_URL=https://your-domain.com
```

## Step 7: Test Authentication

### Local Testing

1. Start both servers:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. You should see:
   - Google One Tap popup (top right)
   - Or "Sign in with Google" button

4. Click to sign in with your Google account

5. After successful login:
   - You'll be redirected to the app
   - Your profile will appear in the header
   - Projects will be saved to your account

### Production Testing

1. Deploy to Railway (see [Deployment Guide](./deployment.md))

2. Update Google OAuth credentials:
   - Add production domain to authorized origins
   - Add production callback URL

3. Test login flow on production domain

## Authentication Flow

### 1. User Clicks "Sign In"

Frontend initiates OAuth flow:
```javascript
// Redirect to Google
window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=openid email profile`
```

### 2. Google Redirects Back

User approves, Google redirects to:
```
https://your-domain.com/auth/callback?code=AUTH_CODE
```

### 3. Exchange Code for Token

Frontend sends code to backend:
```javascript
POST /auth/google
{
  code: "AUTH_CODE"
}
```

### 4. Backend Validates

Backend:
1. Exchanges code for Google tokens
2. Gets user profile from Google
3. Creates/updates user in database
4. Generates JWT token
5. Returns user + token to frontend

### 5. Frontend Stores Session

```javascript
localStorage.setItem('ziner_auth', JSON.stringify({
  user,
  token,
  tokenExpiry
}))
```

## Google One Tap

Google One Tap provides a streamlined sign-in experience.

### How It Works

1. Loads automatically on page load
2. Shows popup in top-right corner
3. User clicks to sign in
4. No redirect required!

### Configuration

Already configured in `frontend/src/components/GoogleOneTap.vue`:

```javascript
google.accounts.id.initialize({
  client_id: GOOGLE_CLIENT_ID,
  callback: handleCredentialResponse,
  auto_select: false,
  cancel_on_tap_outside: true
})
```

### Disable One Tap

To use only standard OAuth:

```javascript
// In GoogleOneTap.vue
const enabled = false // Set to false
```

## Security Best Practices

### JWT Secret

- **Never commit** JWT_SECRET to git
- **Use strong random** strings (32+ characters)
- **Rotate regularly** in production
- **Different per environment** (dev, staging, prod)

### OAuth Credentials

- **Keep Client Secret secure** - never expose in frontend
- **Use environment variables** - not hardcoded
- **Restrict domains** - only authorized origins
- **Monitor usage** in Google Cloud Console

### HTTPS

- **Always use HTTPS** in production
- **Railway provides HTTPS** automatically
- **Update redirect URIs** to use https://

### CORS

Backend must allow your frontend domain:

```javascript
// server/src/index.js
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
```

## Troubleshooting

### "redirect_uri_mismatch" Error

**Cause**: Redirect URI not authorized in Google Console

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add exact redirect URI (including http/https)
4. Wait a few minutes for changes to propagate

### "invalid_client" Error

**Cause**: Wrong Client ID or Client Secret

**Fix**:
1. Verify `GOOGLE_CLIENT_ID` in frontend env
2. Verify `GOOGLE_CLIENT_SECRET` in backend env
3. Check for typos or extra spaces

### One Tap Not Showing

**Causes**:
- Wrong Client ID
- Domain not authorized
- Browser blocking third-party cookies
- Already signed in

**Fix**:
1. Check browser console for errors
2. Verify Client ID matches Google Console
3. Add domain to authorized origins
4. Test in incognito mode

### Token Expired

**Cause**: JWT token expired (default 24h)

**Fix**:
- User will be automatically logged out
- They need to sign in again
- Adjust `JWT_EXPIRY` if needed

### CORS Errors

**Cause**: Backend not allowing frontend domain

**Fix**:
```env
# Backend .env
CORS_ORIGIN=https://your-frontend-domain.com
```

## Development Mode

For local development without OAuth:

```env
# Frontend
VITE_SKIP_AUTH=true

# Backend
SKIP_AUTH=true
```

This bypasses authentication and logs you in as a test user.

## Admin Access

To promote a user to admin:

1. User must sign in once
2. Backend auto-promotes specific emails:

```javascript
// server/routes/auth.js
if (user.email === 'your-admin@gmail.com') {
  user.role = 'admin'
}
```

3. Or manually update in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@gmail.com';
```

## Next Steps

- **Deploy to Production**: [Deployment Guide](./deployment.md)
- **Understand Architecture**: [Architecture Overview](../architecture/overview.md)
- **Explore Features**: [Features Documentation](../features/)

## Resources

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google One Tap Docs](https://developers.google.com/identity/gsi/web)
- [JWT.io](https://jwt.io) - Decode and verify JWTs

---

**Questions?** Check [GitHub Issues](https://github.com/your-repo/issues)
