# Deployment Guide

Deploy Zino to production using Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository
- Google OAuth credentials (see [OAuth Setup](./oauth-setup.md))

## Quick Deploy to Railway

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

Or use the Railway dashboard to create a new project from your GitHub repo.

### 2. Configure Services

Railway will auto-detect your monorepo structure. You need two services:

#### Backend Service
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 4876 (Railway will expose this)

#### Frontend Service
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview` (or use static hosting)
- **Port**: 4173

### 3. Set Environment Variables

#### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=4876
JWT_SECRET=<generate-strong-secret>

# CORS - Your frontend domain
CORS_ORIGIN=https://your-frontend.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Storage (use Railway volume)
STORAGE_PROVIDER=filesystem
RAILWAY_VOLUME_MOUNT_PATH=/data

# Base URL for image serving
BASE_URL=https://your-backend.railway.app

# Database (optional)
DATABASE_URL=<railway-postgres-url>
```

#### Frontend Environment Variables

```env
# API
VITE_API_URL=https://your-backend.railway.app
VITE_APP_URL=https://your-frontend.railway.app

# Auth
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=<your-client-id>
VITE_GOOGLE_REDIRECT_URI=https://your-frontend.railway.app/auth/callback
```

### 4. Add Railway Volume (Backend)

For persistent file storage:

1. Go to your backend service in Railway
2. Click "Variables" → "Add Volume"
3. Mount path: `/data`
4. This will store books and uploads persistently

### 5. Deploy

```bash
# Deploy both services
railway up

# Or deploy specific service
railway up --service backend
railway up --service frontend
```

Railway will:
- Build your applications
- Deploy to production
- Provide HTTPS URLs automatically
- Auto-deploy on git push

## Custom Domain Setup

### Frontend Domain

1. Go to Railway dashboard → Frontend service
2. Click "Settings" → "Domains"
3. Add custom domain: `yourdomain.com`
4. Add DNS records as shown:
   - `CNAME` record pointing to Railway

### Backend Domain (Optional)

1. Go to Railway dashboard → Backend service
2. Add custom domain: `api.yourdomain.com`
3. Update `CORS_ORIGIN` and `VITE_API_URL` accordingly

## Database Setup (Optional)

### Add PostgreSQL

```bash
# Add Postgres plugin in Railway
railway add postgresql

# Railway will automatically set DATABASE_URL
```

### Run Migrations

```bash
# Connect to your Railway project
railway link

# Run migrations
railway run npm run migrate
```

## Monitoring & Logs

### View Logs

```bash
# Backend logs
railway logs --service backend

# Frontend logs
railway logs --service frontend
```

### Railway Dashboard

- View deployments
- Monitor resource usage
- Check build logs
- Manage environment variables

## Health Checks

Add health check endpoints:

**Backend** (`server/src/index.js`):
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

## Troubleshooting

### Build Fails

**Check build logs** in Railway dashboard:
- Missing dependencies?
- Environment variables set?
- Correct build command?

### CORS Errors

Verify `CORS_ORIGIN` in backend matches your frontend URL:
```env
CORS_ORIGIN=https://your-frontend.railway.app
```

### Images Not Loading

Check `BASE_URL` environment variable:
```env
BASE_URL=https://your-backend.railway.app
```

### OAuth Redirect Fails

Update Google OAuth redirect URIs:
1. Go to Google Cloud Console
2. Add: `https://your-frontend.railway.app/auth/callback`
3. Update `VITE_GOOGLE_REDIRECT_URI` in frontend

### Database Connection Issues

Check `DATABASE_URL` format:
```
postgresql://user:password@host:port/database
```

## Production Checklist

### Security
- [ ] Strong `JWT_SECRET` set
- [ ] HTTPS enabled (automatic on Railway)
- [ ] CORS configured for production domain
- [ ] OAuth credentials secured
- [ ] Environment variables not in code

### Performance
- [ ] Frontend built for production (`npm run build`)
- [ ] Images optimized
- [ ] Gzip compression enabled
- [ ] CDN configured (optional)

### Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Logs monitored
- [ ] Health checks configured
- [ ] Uptime monitoring

### Backup
- [ ] Railway volume for persistent storage
- [ ] Database backups enabled
- [ ] Regular data exports

## Scaling

### Horizontal Scaling

Railway supports horizontal scaling:
1. Go to service settings
2. Increase replicas
3. Load balancing is automatic

### Vertical Scaling

Upgrade Railway plan for:
- More CPU
- More RAM
- More storage

## Cost Optimization

### Railway Pricing

- **Hobby Plan**: $5/month (good for testing)
- **Pro Plan**: Usage-based (production)

### Optimize Costs

1. **Use volumes** instead of database for simple storage
2. **Optimize images** before upload
3. **Enable caching** for static assets
4. **Monitor usage** in Railway dashboard

## Alternative Deployment Options

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel
```

### Heroku (Full Stack)

```bash
# Create Heroku apps
heroku create zino-backend
heroku create zino-frontend

# Deploy
git push heroku main
```

### Docker (Self-Hosted)

See `Dockerfile` in each service directory.

## CI/CD

Railway auto-deploys on git push. For custom CI/CD:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: GitHub Issues

---

**Next**: [OAuth Setup Guide](./oauth-setup.md)
