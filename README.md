# Zino - Visual Zine Creation Tool

**Version**: 2.0.0 (Production Ready)  
**Status**: ✅ Ready to Deploy

A modern, web-based zine creation tool with drag-and-drop layouts, media management, and professional PDF export.

## 🚀 Quick Start

### First Time Setup
```bash
# Install all dependencies
npm run install:all
```

### Development
```bash
# Start both frontend and backend
npm run dev

# Visit http://localhost:5173
```

### Individual Services
```bash
npm run dev:server    # Backend only (port 4876)
npm run dev:client    # Frontend only (port 5173)
```

## 📚 Documentation

**[📖 Complete Documentation](docs/README.md)** - Main documentation hub

### Quick Links
- **[Quick Start Guide](docs/getting-started/quick-start.md)** - Get running in 5 minutes
- **[Deployment Guide](docs/getting-started/deployment.md)** - Deploy to Railway
- **[OAuth Setup](docs/getting-started/oauth-setup.md)** - Configure Google OAuth
- **[Architecture Overview](docs/architecture/overview.md)** - System design
- **[API Reference](docs/api/overview.md)** - REST API documentation

### More Documentation
- [Features](docs/features/) - Feature documentation
- [Development](docs/development/) - Contributing guidelines
- [Archive](docs/archive/) - Historical documentation

## 📂 Repository Structure

```
ziner/
├── frontend/                    # Vue 3 Frontend
│   ├── src/
│   │   ├── api/                # API client
│   │   ├── components/         # Vue components
│   │   ├── services/           # Auth services
│   │   ├── stores/             # Pinia stores
│   │   └── config/             # Environment config
│   └── package.json
│
├── server/                      # Express Backend
│   ├── src/
│   │   └── index.js           # Main server
│   ├── services/
│   │   └── storage/            # Storage abstraction
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth middleware
│   └── data/                   # Data storage
│
├── docs/                        # Documentation
│   ├── getting-started/        # Setup guides
│   ├── architecture/           # System design
│   ├── features/               # Feature docs
│   ├── api/                    # API reference
│   └── archive/                # Historical docs
└── package.json                 # Root scripts
```

## ✨ Features

### Production Ready (v2.0)
- ✅ **Storage Abstraction** - Switch between filesystem/S3 via env variable
- ✅ **Google OAuth** - Production authentication ready
- ✅ **JWT Sessions** - Secure token-based authentication
- ✅ **Role-Based Access** - User and Admin permissions
- ✅ **Environment Config** - Separate dev/prod settings
- ✅ **Development Mode** - No auth barriers locally

### Core Features
- ✅ Drag-and-drop page layouts
- ✅ Media library management
- ✅ Professional PDF export
- ✅ Margin and bleed controls
- ✅ Multiple page layouts
- ✅ Background color support
- ✅ Image fit modes (cover/contain)
- ✅ Flipbook preview
- ✅ Custom layout builder

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:server       # Backend only
npm run dev:client       # Frontend only

# Production
npm run build            # Build frontend for production
npm start:server         # Start backend (production mode)

# Utilities
npm run install:all      # Install all dependencies
npm run clean           # Clean all node_modules
npm run lint            # Run linter
```

## 🌍 Environment Configuration

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:4876
VITE_SKIP_AUTH=true                 # Development mode
VITE_GOOGLE_CLIENT_ID=your-id       # Production OAuth
```

### Backend (.env)
```bash
STORAGE_PROVIDER=filesystem         # or 's3'
SKIP_AUTH=true                      # Development mode
JWT_SECRET=your-secret              # Production secret
```

See `.env.example` files in `frontend/` and `server/` directories.

## 🚀 Deployment

**Quick Deploy to Railway:**
1. Set up Google OAuth credentials
2. Configure environment variables
3. Deploy: `railway up`

**Full Guide:** See [Deployment Guide](docs/getting-started/deployment.md)

## 📖 Learn More

- **Architecture**: [Architecture Overview](docs/architecture/overview.md)
- **API Reference**: [API Documentation](docs/api/overview.md)
- **Features**: [Feature Guides](docs/features/)
- **Contributing**: [Development Guide](docs/development/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

---

**Ready to create beautiful zines!** 📚✨
