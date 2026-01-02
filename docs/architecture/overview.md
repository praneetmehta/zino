# Architecture Overview

Zino is a full-stack web application for creating print-ready zines and publications.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 + Vite                                        │  │
│  │  ├── Components (UI)                                 │  │
│  │  ├── Stores (Pinia - State Management)              │  │
│  │  ├── Services (API Client, Auth)                    │  │
│  │  └── Utils (PDF Export, Layout System)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js                                          │  │
│  │  ├── Routes (API Endpoints)                         │  │
│  │  ├── Middleware (Auth, CORS, Error Handling)       │  │
│  │  ├── Services (Storage, Database, OAuth)           │  │
│  │  └── Models (Data Access Layer)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │   File Storage   │    │   PostgreSQL     │
    │   (Volume/S3)    │    │   (Optional)     │
    │  - Books         │    │  - Users         │
    │  - Uploads       │    │  - Sessions      │
    │  - Templates     │    │  - Orders        │
    └──────────────────┘    └──────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: CSS Variables (Dark/Light themes)
- **PDF Generation**: html2canvas + jsPDF
- **HTTP Client**: Fetch API
- **Authentication**: Google OAuth 2.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + Google OAuth
- **Database**: PostgreSQL (optional)
- **Storage**: Filesystem or S3-compatible
- **File Upload**: Multer

### Infrastructure
- **Hosting**: Railway
- **Storage**: Railway Volumes or AWS S3
- **Database**: Railway PostgreSQL
- **CDN**: Railway (automatic)

## Core Components

### 1. Editor System

The heart of Zino - a visual canvas for creating layouts.

**Key Features**:
- Drag-and-drop interface
- Multiple page layouts
- Image slots with fit options
- Floating text elements
- Layer management
- Undo/redo support

**Components**:
- `Canvas.vue` - Main editor canvas
- `MediaPanel.vue` - Image library
- `PagePanel.vue` - Page thumbnails
- `Header.vue` - Top toolbar

### 2. Layout System

Flexible layout engine for creating page templates.

**Types**:
- **Built-in Layouts** - Pre-defined templates
- **Custom Layouts** - User-created layouts
- **Layout Builder** - Visual layout creator

**Storage**:
```
server/data/
├── layouts/           # Built-in layouts
└── customLayouts/     # User layouts
```

### 3. Template System

Marketplace for pre-made zine templates.

**Features**:
- Browse templates by category
- Preview before use
- Clone to user's library
- Admin template builder

**Flow**:
1. Admin creates template with demo images
2. Template saved with locked text elements
3. User previews template
4. User clones template (images stripped)
5. User customizes with own content

### 4. Storage Abstraction

Pluggable storage system supporting multiple backends.

**Interface**:
```javascript
class StorageService {
  async saveBook(bookId, data, userId)
  async getBook(bookId, userId)
  async listBooks(userId)
  async deleteBook(bookId, userId)
  async uploadFile(file, metadata)
}
```

**Implementations**:
- `FilesystemStorage` - Local file storage
- `S3Storage` - AWS S3 or compatible

### 5. Authentication System

Multi-provider auth with JWT sessions.

**Flow**:
```
User → Google OAuth → Backend validates → JWT token → Frontend stores
```

**Components**:
- `GoogleOneTap.vue` - One-tap sign-in
- `authStore.js` - Auth state management
- `auth.js` (backend) - Token generation/validation

### 6. PDF Export

Client-side PDF generation with print-ready output.

**Process**:
1. Render pages to canvas (html2canvas)
2. Convert to PDF (jsPDF)
3. Add bleed and crop marks
4. Download or upload

**Features**:
- Bleed support
- Crop marks
- High resolution (300 DPI)
- Multi-page support

## Data Flow

### Creating a Project

```
1. User clicks "Create New"
   └→ InitModal.vue (select size/binding)
      └→ zineStore.initializeZine()
         └→ Creates empty project in memory

2. User adds pages
   └→ Canvas.vue → Add Page button
      └→ zineStore.addPage(layout)
         └→ Generates page with slots

3. User uploads images
   └→ MediaPanel.vue → Drop/Upload
      └→ POST /api/uploads
         └→ storageService.uploadFile()
            └→ Returns file URL
               └→ zineStore.addMediaAsset()

4. User drags image to slot
   └→ Canvas.vue → Drag handler
      └→ zineStore.setSlotImage(slotId, assetId)

5. User saves project
   └→ Header.vue → Save button
      └→ POST /api/books
         └→ storageService.saveBook()
            └→ Saves JSON to storage
```

### Loading a Project

```
1. User clicks project in library
   └→ LandingPage.vue → Project card
      └→ GET /api/books/:id
         └→ storageService.getBook()
            └→ Returns project JSON

2. Frontend loads project
   └→ zineStore.importFromJSON(data)
      └→ Restores:
         - Config (size, bleed, etc.)
         - Pages and layouts
         - Image references
         - Text elements

3. Images loaded on-demand
   └→ Canvas.vue renders slots
      └→ <img :src="getImageUrl(assetId)">
         └→ Fetches from storage
```

## State Management

### Pinia Stores

**zineStore** - Main editor state
```javascript
{
  zineConfig: { width, height, bleed, binding, ... },
  pages: [{ id, layout, slots, textElements }, ...],
  mediaAssets: [{ id, url, name, size }, ...],
  selectedPageId: string,
  ui: { theme, showGuides, ... }
}
```

**authStore** - Authentication state
```javascript
{
  user: { id, email, name, avatar, role },
  token: string,
  isAuthenticated: boolean,
  isAdmin: boolean
}
```

## API Endpoints

### Books
- `GET /api/books` - List user's books
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create/update book
- `DELETE /api/books/:id` - Delete book

### Templates
- `GET /api/templates/books` - List templates
- `GET /api/templates/books/:id` - Get template
- `POST /api/templates/books/:id/clone` - Clone template
- `POST /api/templates/books` - Create template (admin)

### Uploads
- `POST /api/uploads` - Upload file
- `GET /api/uploads/:filename` - Get file
- `DELETE /api/uploads/:filename` - Delete file

### Auth
- `POST /auth/google` - Google OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/books` - All books
- `GET /api/admin/templates` - All templates
- `DELETE /api/admin/books/:id` - Delete any book

## Security

### Authentication
- JWT tokens with expiry
- Secure HTTP-only cookies (optional)
- Google OAuth 2.0
- CSRF protection

### Authorization
- Role-based access (user/admin)
- Resource ownership validation
- Admin-only endpoints

### Data Protection
- Input validation
- SQL injection prevention (parameterized queries)
- XSS protection (Vue auto-escaping)
- File upload restrictions

## Performance

### Frontend Optimization
- Code splitting (Vite)
- Lazy loading components
- Image optimization
- Virtual scrolling for large lists
- Debounced auto-save

### Backend Optimization
- Efficient file I/O
- Streaming large files
- Database indexing
- Caching (future)

### Storage Optimization
- Compressed JSON storage
- Image resizing on upload
- CDN for static assets

## Scalability

### Horizontal Scaling
- Stateless backend (JWT)
- Shared storage (S3)
- Load balancing ready

### Vertical Scaling
- Efficient memory usage
- Streaming for large files
- Database connection pooling

## Monitoring

### Logging
- Structured logging
- Error tracking
- Request logging
- Performance metrics

### Health Checks
- `/health` endpoint
- Database connectivity
- Storage availability

## Future Enhancements

### Planned Features
- Real-time collaboration
- Version history
- Advanced text editing
- More export formats
- Mobile app

### Technical Improvements
- Redis caching
- WebSocket for real-time
- GraphQL API
- Microservices architecture

## Development Workflow

```
1. Local Development
   ├── npm run dev (both services)
   ├── Hot reload enabled
   └── No auth required

2. Testing
   ├── Unit tests (Jest)
   ├── Integration tests
   └── E2E tests (Playwright)

3. Deployment
   ├── Git push to main
   ├── Railway auto-deploys
   └── Environment variables applied

4. Monitoring
   ├── Railway logs
   ├── Error tracking
   └── Performance monitoring
```

## Related Documentation

- [Frontend Architecture](./frontend.md) - Detailed frontend structure
- [Backend Architecture](./backend.md) - Detailed backend structure
- [Database Schema](./database.md) - Database design
- [API Reference](../api/overview.md) - Complete API docs

---

*Last updated: January 2026*
