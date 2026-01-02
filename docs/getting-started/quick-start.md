# Quick Start Guide

Get Zino running locally in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/zino.git
cd zino
```

### 2. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm install
```

This will install dependencies for both the frontend and backend automatically.

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This command starts:
- **Backend** on http://localhost:4876
- **Frontend** on http://localhost:3000

### 4. Open in Browser

Navigate to http://localhost:3000

You'll be automatically logged in as a development user - no authentication required!

## What's Running?

### Backend (Port 4876)
- Express API server
- File storage service
- Authentication middleware (bypassed in dev mode)
- Data stored in `server/data/`

### Frontend (Port 3000)
- Vue 3 + Vite dev server
- Hot module replacement enabled
- Auto-login in development mode

## Project Structure

```
zino/
├── frontend/                 # Vue 3 application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── stores/          # Pinia state management
│   │   ├── api/             # API client
│   │   └── App.vue          # Root component
│   └── package.json
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Auth, CORS, etc.
│   ├── data/               # File storage
│   │   ├── books/          # User projects
│   │   └── uploads/        # Media files
│   └── package.json
│
└── package.json             # Root package (runs both)
```

## Development Mode Features

### Auto-Login
- No Google OAuth required
- Automatically logged in as "Alice (Admin)"
- Full admin access to test features

### File Storage
- Books saved to `server/data/books/`
- Uploads saved to `server/data/uploads/`
- No cloud storage needed

### Hot Reload
- Frontend changes reload instantly
- Backend restarts automatically with nodemon

## Common Tasks

### Create a New Project
1. Click "Create New" on landing page
2. Choose page size and binding type
3. Start designing!

### Add Images
1. Click "Media" panel
2. Drag & drop images or click to upload
3. Drag images onto page slots

### Export PDF
1. Click "Export" in header
2. Choose export options
3. Download print-ready PDF

### Save Project
- Auto-saves every 30 seconds
- Manual save: Click "Save" in header
- Saved to `server/data/books/`

## Troubleshooting

### Port Already in Use

**Backend (4876)**:
```bash
# Find and kill process
lsof -ti:4876 | xargs kill -9
```

**Frontend (3000)**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### CORS Errors
Make sure both servers are running. The backend is configured to allow `localhost:3000` in development.

### Changes Not Reflecting
- **Frontend**: Should hot-reload automatically
- **Backend**: Restart with `npm run dev`

### Can't Upload Images
Check that `server/data/uploads/` directory exists and is writable.

## Next Steps

- **Deploy to Production**: See [Deployment Guide](./deployment.md)
- **Set Up OAuth**: See [OAuth Setup](./oauth-setup.md)
- **Understand Architecture**: See [Architecture Overview](../architecture/overview.md)
- **Explore Features**: See [Features Documentation](../features/)

## Development Tips

### Environment Variables

Create `.env` files for custom configuration:

**Frontend** (`frontend/.env.development`):
```env
VITE_API_URL=http://localhost:4876
VITE_SKIP_AUTH=true
```

**Backend** (`server/.env`):
```env
PORT=4876
NODE_ENV=development
SKIP_AUTH=true
CORS_ORIGIN=http://localhost:3000
```

### Useful Commands

```bash
# Start only frontend
cd frontend && npm run dev

# Start only backend
cd server && npm run dev

# Build for production
npm run build

# Run tests (when available)
npm test
```

## Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Browse [docs/](../README.md)
- **Architecture**: Read [Architecture Overview](../architecture/overview.md)

---

**Happy coding!** 🚀
