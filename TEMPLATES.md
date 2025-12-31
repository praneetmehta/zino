# Book & Cover Templates System

## Overview

The templates system allows users to quickly create books from pre-designed templates and apply professional cover designs.

## Features

### 1. Book Templates
- **Pre-designed books** with fixed number of pages and layouts
- Users can clone templates and fill with their own images
- Each template includes:
  - Page layouts (slots for images)
  - Text elements with styling
  - Book configuration (size, binding, margins)
  - Metadata (category, tags, description)

### 2. Cover Templates
- **Professional cover designs** for front, back, and spine
- Can be applied to any existing book
- Includes:
  - Background colors/images
  - Text elements with typography
  - Layout for hardcover or softcover

## API Endpoints

### Book Templates

#### `GET /api/templates/books`
List all available book templates (metadata only)

**Response:**
```json
{
  "templates": [
    {
      "id": "travel-journal",
      "name": "Travel Journal",
      "description": "A beautiful 20-page travel journal template",
      "thumbnail": "/templates/thumbnails/travel-journal.jpg",
      "pageCount": 20,
      "category": "travel",
      "tags": ["travel", "journal", "photos"],
      "config": { "width": 8, "height": 8, "unit": "in" }
    }
  ]
}
```

#### `GET /api/templates/books/:id`
Get full template data including all pages

#### `POST /api/templates/books/:id/clone`
Clone a template for the authenticated user

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "book": { /* full book data */ },
  "message": "Template cloned successfully"
}
```

### Cover Templates

#### `GET /api/templates/covers`
List all available cover templates

#### `GET /api/templates/covers/:id`
Get specific cover template

#### `POST /api/templates/covers/:id/apply`
Apply cover template to a user's book

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "bookId": "book-123456"
}
```

## File Structure

```
server/data/templates/
├── books/
│   ├── travel-journal.json
│   ├── wedding-album.json
│   └── ...
└── covers/
    ├── modern-minimal.json
    ├── elegant-serif.json
    └── ...
```

## Template Format

### Book Template
```json
{
  "id": "template-id",
  "name": "Template Name",
  "description": "Description",
  "thumbnail": "/path/to/thumbnail.jpg",
  "category": "travel",
  "tags": ["tag1", "tag2"],
  "config": {
    "width": 8,
    "height": 8,
    "unit": "in",
    "bleed": 0.125,
    "margin": 0.5,
    "binding": "perfect"
  },
  "pages": [
    {
      "id": "page-1",
      "layoutId": "single-large",
      "slots": [ /* image slots */ ],
      "textElements": [ /* text elements */ ]
    }
  ],
  "metadata": {
    "author": "Zino Templates",
    "version": "1.0",
    "createdAt": "2025-12-31T00:00:00.000Z"
  }
}
```

### Cover Template
```json
{
  "id": "cover-id",
  "name": "Cover Name",
  "description": "Description",
  "thumbnail": "/path/to/thumbnail.jpg",
  "category": "minimal",
  "tags": ["minimal", "modern"],
  "coverType": "hardcover",
  "front": {
    "backgroundColor": "#2c3e50",
    "textElements": [ /* text elements */ ],
    "imageSlots": [ /* optional image slots */ ]
  },
  "back": { /* same structure as front */ },
  "spine": { /* same structure as front */ }
}
```

## Frontend Components

### `TemplateGallery.vue`
Modal component for browsing and selecting templates

**Props:**
- `mode`: 'book' or 'cover'
- `bookId`: Required for cover mode

**Events:**
- `close`: Close the gallery
- `template-selected`: Template was selected/applied

**Usage:**
```vue
<TemplateGallery
  mode="book"
  @close="showGallery = false"
  @template-selected="handleTemplateSelected"
/>
```

## Categories

### Book Categories
- `travel` - Travel journals and photo books
- `wedding` - Wedding albums
- `baby` - Baby books and albums
- `yearbook` - School yearbooks
- `portfolio` - Professional portfolios

### Cover Categories
- `minimal` - Clean, minimal designs
- `elegant` - Sophisticated, classic designs
- `bold` - Strong, impactful designs
- `vintage` - Retro, nostalgic designs

## Creating New Templates

### 1. Create Template File
Create a JSON file in the appropriate directory:
- Book: `server/data/templates/books/template-id.json`
- Cover: `server/data/templates/covers/template-id.json`

### 2. Add Thumbnail (Optional)
Place thumbnail image in `frontend/public/templates/thumbnails/`

### 3. Test Template
- Templates are automatically loaded on server start
- Use the Template Gallery to browse and test

## Admin Routes (Future)

Currently, templates are created by manually adding JSON files. Future admin routes:

- `POST /api/templates/books` - Create book template
- `PUT /api/templates/books/:id` - Update book template
- `DELETE /api/templates/books/:id` - Delete book template
- Same for cover templates

## Security

- Template listing is public (no auth required)
- Cloning/applying templates requires authentication
- Templates are read-only for users
- User books created from templates are fully editable

## Performance

- Template metadata is cached in memory
- Full template data loaded on-demand
- Thumbnails served as static assets
- No database queries for template browsing
