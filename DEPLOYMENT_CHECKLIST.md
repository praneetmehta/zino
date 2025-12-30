# Production Deployment Checklist

**Use this checklist before deploying to production**

---

## ✅ Pre-Deployment

### Frontend Configuration

- [ ] Create `frontend/.env.production` from `.env.example`
- [ ] Set `VITE_APP_ENV=production`
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Set `VITE_SKIP_AUTH=false`
- [ ] Configure Google OAuth:
  - [ ] Set `VITE_GOOGLE_CLIENT_ID`
  - [ ] Set `VITE_GOOGLE_REDIRECT_URI`
- [ ] Choose storage provider:
  - [ ] `VITE_STORAGE_PROVIDER=api` (simple, default)
  - [ ] `VITE_STORAGE_PROVIDER=s3` (scalable, recommended)
- [ ] If using S3:
  - [ ] Set `VITE_S3_BUCKET`
  - [ ] Set `VITE_S3_REGION`
  - [ ] Set `VITE_S3_CDN_URL` (optional)
- [ ] Set `VITE_ENABLE_DEBUG=false`
- [ ] Set `VITE_MAX_UPLOAD_SIZE` (bytes, e.g., 10485760 = 10MB)

### Backend Configuration

- [ ] Create `server/.env` for production
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT` (e.g., 4876)
- [ ] Set `CORS_ORIGIN` to frontend production URL
- [ ] Set strong `JWT_SECRET` (random 64+ characters)
- [ ] Set strong `SESSION_SECRET`
- [ ] Configure Google OAuth:
  - [ ] Set `GOOGLE_CLIENT_ID`
  - [ ] Set `GOOGLE_CLIENT_SECRET`
- [ ] Set `SKIP_AUTH=false`
- [ ] If using S3:
  - [ ] Set `AWS_ACCESS_KEY_ID`
  - [ ] Set `AWS_SECRET_ACCESS_KEY`
  - [ ] Set `AWS_REGION`
  - [ ] Set `S3_BUCKET`
- [ ] Set `MAX_FILE_SIZE` (bytes)
- [ ] Set database URL if using database (TODO: when implementing)

### Google OAuth Setup

- [ ] Create Google Cloud Console project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs:
  - Development: `http://localhost:5173/auth/callback`
  - Production: `https://yourdomain.com/auth/callback`
- [ ] Copy Client ID and Client Secret to env files
- [ ] Test OAuth flow in development first

### Security

- [ ] Verify `.env` files are in `.gitignore`
- [ ] Never commit production env files to git
- [ ] Use strong, unique secrets for JWT and sessions
- [ ] Enable HTTPS on production domain
- [ ] Configure CORS to only allow production domains
- [ ] Review and update CSP headers
- [ ] Enable rate limiting (add express-rate-limit)
- [ ] Add input validation middleware
- [ ] Set up error tracking (Sentry recommended)

---

## 🔧 Build & Test

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Test that build works
curl http://localhost:4173
```

### Backend

```bash
cd server

# Install dependencies
npm install

# Test in production mode locally
NODE_ENV=production npm start

# Verify health endpoint
curl http://localhost:4876/health
```

### Integration Testing

- [ ] Test login flow with Google OAuth
- [ ] Test creating a new zine
- [ ] Test saving to library
- [ ] Test loading from library
- [ ] Test uploading media
- [ ] Test exporting PDF
- [ ] Test role-based access (if applicable)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices

---

## 🚀 Deployment Options

> **Note**: The application is platform-agnostic. Choose any hosting provider that supports Node.js (backend) and static sites (frontend). Below are common options:

### Option 1: Railway (Both Services)
See `RAILWAY_DEPLOYMENT.md` for detailed guide or `RAILWAY_QUICK_START.md` for quick setup.

### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

Configuration:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Add all `VITE_*` vars in Vercel dashboard

**Backend (Railway):**
```bash
cd server
npm install -g railway
railway login
railway init
railway up
```

Configuration:
- Add all environment variables in Railway dashboard
- Set custom domain if needed

### Option 2: Docker Deployment

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    restart: unless-stopped

  backend:
    build: ./server
    ports:
      - "4876:4876"
    env_file:
      - ./server/.env
    restart: unless-stopped
    volumes:
      - ./data:/app/data
```

**Deploy:**
```bash
docker-compose up -d
```

### Option 3: Traditional Server (Nginx + PM2)

**Frontend (Nginx):**
```bash
# Build locally
cd frontend
npm run build

# Upload dist/ to server
scp -r dist/* user@server:/var/www/ziner/

# Configure Nginx (see PRODUCTION_SETUP.md)
```

**Backend (PM2):**
```bash
# On server
cd server
npm install --production
pm2 start src/index.js --name ziner-api
pm2 save
pm2 startup
```

---

## 🔒 Post-Deployment Security

- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Add rate limiting to API
- [ ] Set up monitoring alerts
- [ ] Enable DDoS protection (Cloudflare recommended)
- [ ] Review and restrict database access
- [ ] Implement regular security audits

---

## 📊 Monitoring Setup

### Error Tracking

- [ ] Sign up for Sentry
- [ ] Install Sentry SDK:
  ```bash
  npm install @sentry/vue @sentry/node
  ```
- [ ] Configure Sentry in frontend and backend
- [ ] Test error reporting

### Analytics

- [ ] Set up Google Analytics or Plausible
- [ ] Add tracking code to frontend
- [ ] Configure custom events
- [ ] Test data collection

### Uptime Monitoring

- [ ] Sign up for UptimeRobot or Pingdom
- [ ] Add monitors for:
  - Frontend URL
  - Backend /health endpoint
  - API endpoints
- [ ] Configure alert notifications

### Performance Monitoring

- [ ] Set up Lighthouse CI
- [ ] Configure performance budgets
- [ ] Monitor Core Web Vitals

---

## 🧪 Smoke Tests After Deployment

**Frontend:**
- [ ] Visit production URL
- [ ] Check console for errors
- [ ] Test login flow
- [ ] Create a test zine
- [ ] Upload a test image
- [ ] Export PDF
- [ ] Test on mobile

**Backend:**
- [ ] Check `/health` endpoint returns 200
- [ ] Test `/auth/google` endpoint
- [ ] Test `/books` CRUD operations
- [ ] Check logs for errors
- [ ] Verify database connectivity (if applicable)

**Integration:**
- [ ] Login with Google
- [ ] Create and save a zine
- [ ] Reload page (test session persistence)
- [ ] Load saved zine
- [ ] Delete saved zine
- [ ] Test logout

---

## 🔄 Rollback Plan

If deployment fails:

1. **Frontend:** Revert to previous Vercel/Netlify deployment
2. **Backend:** 
   ```bash
   pm2 restart ziner-api@previous
   # or
   railway rollback
   ```
3. **Database:** Restore from latest backup (if applicable)
4. **DNS:** Revert DNS changes if made

---

## 📝 Post-Deployment Tasks

- [ ] Update README.md with production URL
- [ ] Create admin user (if needed)
- [ ] Test all critical user flows
- [ ] Monitor error logs for 24-48 hours
- [ ] Gather user feedback
- [ ] Document any issues encountered
- [ ] Update deployment documentation

---

## 🎯 Performance Targets

- [ ] Lighthouse Score > 90
- [ ] Time to Interactive < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] API response time < 200ms (avg)
- [ ] Uptime > 99.9%

---

## 📞 Emergency Contacts

- DevOps Lead: [email]
- Infrastructure Provider: [support link]
- Database Admin: [email]
- Security Team: [email]

---

## ✅ Final Sign-Off

- [ ] All checklist items completed
- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated

**Deployed by:** _________________  
**Date:** _________________  
**Version:** _________________  

---

**🎉 Deployment Complete!**

Monitor the application for the first 24-48 hours and be ready to respond to any issues.
