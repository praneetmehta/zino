# Zino Documentation

Welcome to the Zino documentation! This guide will help you understand, use, and contribute to Zino.

## 📚 Table of Contents

### Getting Started
- [Quick Start Guide](./getting-started/quick-start.md) - Set up your local development environment
- [Deployment Guide](./getting-started/deployment.md) - Deploy to production (Railway)
- [OAuth Setup](./getting-started/oauth-setup.md) - Configure Google OAuth

### Architecture
- [System Overview](./architecture/overview.md) - High-level architecture
- [Frontend Architecture](./architecture/frontend.md) - Vue 3 + Pinia structure
- [Backend Architecture](./architecture/backend.md) - Express API structure
- [Database Schema](./architecture/database.md) - PostgreSQL schema

### Features
- [Editor](./features/editor.md) - Core editing features
- [Templates](./features/templates.md) - Template system
- [Layouts](./features/layouts.md) - Layout builder
- [Media Management](./features/media.md) - Image uploads and management
- [PDF Export](./features/export.md) - PDF generation
- [Authentication](./features/authentication.md) - User authentication

### API Reference
- [API Overview](./api/overview.md) - REST API documentation
- [Books API](./api/books.md) - Book management endpoints
- [Templates API](./api/templates.md) - Template endpoints
- [Uploads API](./api/uploads.md) - File upload endpoints
- [Admin API](./api/admin.md) - Admin dashboard endpoints

### Development
- [Contributing](./development/contributing.md) - How to contribute
- [Code Style](./development/code-style.md) - Coding standards
- [Testing](./development/testing.md) - Testing guidelines

### Archive
Historical documentation for reference:
- [Feature Implementations](./archive/features/) - Individual feature docs
- [Bug Fixes](./archive/fixes/) - Bug fix documentation
- [Migrations](./archive/migration/) - Migration guides

## 🚀 Quick Links

- **Local Development**: `npm run dev` (runs both frontend and backend)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4876
- **Production**: https://your-domain.com

## 📖 What is Zino?

Zino is a modern web-based zine maker that allows users to create beautiful print-ready publications. It features:

- **Visual Editor** - Drag-and-drop interface for creating layouts
- **Template System** - Pre-built templates for quick starts
- **Layout Builder** - Create custom reusable layouts
- **PDF Export** - Print-ready PDF generation with bleed and margins
- **Cloud Storage** - Save and manage your projects
- **Authentication** - Google OAuth integration

## 🏗️ Tech Stack

- **Frontend**: Vue 3, Pinia, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (optional)
- **Storage**: Filesystem or Cloud (S3-compatible)
- **Deployment**: Railway
- **PDF Generation**: html2canvas + jsPDF

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./development/contributing.md) to get started.

## 📝 License

[Add your license here]

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
