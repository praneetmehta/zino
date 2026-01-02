# Templates API

Browse and use pre-made zine templates.

## Endpoints

### GET /api/templates/books

List all available book templates.

**Authentication**: Optional (public endpoint)

**Request**:
```http
GET /api/templates/books HTTP/1.1
```

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "template-1704067200000",
      "name": "Magazine Layout",
      "description": "Modern magazine-style layout with multiple columns",
      "category": "magazine",
      "price": 0,
      "thumbnail": "http://localhost:4876/uploads/template-thumb.jpg",
      "tags": ["magazine", "modern", "multi-column"],
      "metadata": {
        "author": "Admin User",
        "version": "1.0",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Query Parameters** (future):
- `category` - Filter by category
- `sort` - Sort by field (name, createdAt, etc.)
- `limit` - Number of results

**Errors**:
- `500 Internal Server Error` - Server error

---

### GET /api/templates/books/:id

Get a specific template with full details including pages and demo images.

**Authentication**: Optional (public endpoint)

**Parameters**:
- `id` (path) - Template ID

**Request**:
```http
GET /api/templates/books/template-1704067200000 HTTP/1.1
```

**Response** (200 OK):
```json
{
  "template": {
    "id": "template-1704067200000",
    "name": "Magazine Layout",
    "description": "Modern magazine-style layout",
    "category": "magazine",
    "price": 0,
    "thumbnail": "http://localhost:4876/uploads/template-thumb.jpg",
    "tags": ["magazine", "modern"],
    "config": {
      "width": 8.5,
      "height": 11,
      "unit": "in",
      "bleed": 0.125,
      "margin": 0.5,
      "bindingType": "folded",
      "gutter": 0.25
    },
    "pages": [
      {
        "id": "page-1",
        "type": "two-column",
        "layoutId": "two-column",
        "slots": [
          {
            "id": "slot-1",
            "x": 0,
            "y": 0,
            "width": 50,
            "height": 100,
            "assetId": "demo-image-1.jpg",
            "fit": "cover",
            "backgroundColor": null
          }
        ],
        "textElements": [
          {
            "id": "text-1",
            "content": "Magazine Title",
            "x": 50,
            "y": 50,
            "width": 300,
            "height": 80,
            "locked": true,
            "style": {
              "fontSize": 48,
              "fontFamily": "Arial",
              "color": "#000000"
            }
          }
        ]
      }
    ],
    "demoImages": [
      {
        "id": "demo-image-1.jpg",
        "name": "demo-1.jpg",
        "url": "http://localhost:4876/uploads/demo-image-1.jpg",
        "size": "1.2 MB",
        "sizeBytes": 1258291,
        "type": "image/jpeg"
      }
    ],
    "metadata": {
      "author": "Admin User",
      "version": "1.0",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Notes**:
- `demoImages` are included for preview
- Text elements have `locked: true` in templates
- Slots contain `assetId` references to demo images

**Errors**:
- `404 Not Found` - Template doesn't exist
- `500 Internal Server Error` - Server error

---

### POST /api/templates/books/:id/clone

Clone a template to create a new user book.

**Authentication**: Required

**Parameters**:
- `id` (path) - Template ID

**Request**:
```http
POST /api/templates/books/template-1704067200000/clone HTTP/1.1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "book": {
    "id": "book-1704067200000",
    "userId": "user_123",
    "title": "Magazine Layout (Copy)",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "data": {
      "zineConfig": { ... },
      "pages": [
        {
          "id": "page-1704067200000-0",
          "layout": "two-column",
          "slots": [
            {
              "id": "slot-1704067200000-0-0",
              "x": 0,
              "y": 0,
              "width": 50,
              "height": 100,
              "assetId": null,        // Images stripped
              "url": null,
              "imageId": null,
              "fit": "cover",
              "backgroundColor": null  // Colors preserved
            }
          ],
          "textElements": [
            {
              "id": "text-1704067200000-0-0",
              "content": "Magazine Title",
              "locked": false,        // Unlocked for editing
              "style": { ... }
            }
          ]
        }
      ],
      "mediaAssets": []              // Empty - user adds their own
    },
    "metadata": {
      "isFromTemplate": true,
      "templateId": "template-1704067200000",
      "templateName": "Magazine Layout"
    }
  },
  "message": "Template cloned successfully"
}
```

**What Gets Cloned**:
- ✅ Page layouts and structure
- ✅ Slot positions and sizes
- ✅ Text content and styling
- ✅ Colors and styling properties
- ✅ Configuration (size, bleed, etc.)

**What Gets Stripped**:
- ❌ Demo images (assetId set to null)
- ❌ Media assets (empty array)

**What Gets Unlocked**:
- 🔓 Text elements (locked: false)

**Errors**:
- `401 Unauthorized` - No/invalid token
- `404 Not Found` - Template doesn't exist
- `500 Internal Server Error` - Server error

---

### POST /api/templates/books

Create a new template (admin only).

**Authentication**: Required  
**Authorization**: Admin role required

**Request Body**:
```json
{
  "id": "template-1704067200000",
  "name": "Magazine Layout",
  "description": "Modern magazine-style layout",
  "category": "magazine",
  "price": 0,
  "thumbnail": "http://localhost:4876/uploads/template-thumb.jpg",
  "tags": ["magazine", "modern"],
  "config": {
    "width": 8.5,
    "height": 11,
    "unit": "in",
    "bleed": 0.125,
    "margin": 0.5,
    "bindingType": "folded",
    "gutter": 0.25
  },
  "pages": [...],
  "demoImages": [...],
  "metadata": {
    "author": "Admin User",
    "version": "1.0",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Request**:
```http
POST /api/templates/books HTTP/1.1
Authorization: Bearer <admin_token>
Content-Type: application/json

{ ... }
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Book template created"
}
```

**Validation Rules**:
- `id` - Required, unique
- `name` - Required, string
- `description` - Optional, string
- `category` - Required, string
- `config` - Required, valid config object
- `pages` - Required, array

**Errors**:
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

## Template Structure

### Template Metadata

```typescript
{
  id: string
  name: string
  description: string
  category: string
  price: number
  thumbnail: string
  tags: string[]
  metadata: {
    author: string
    version: string
    createdAt: string
  }
}
```

### Template Categories

Common categories:
- `magazine` - Magazine-style layouts
- `zine` - Traditional zine layouts
- `booklet` - Booklet/pamphlet layouts
- `poster` - Poster-style layouts
- `catalog` - Catalog layouts
- `newsletter` - Newsletter layouts

### Demo Images

Templates include demo images for preview:

```typescript
{
  id: string         // Filename
  name: string       // Original name
  url: string        // Full URL
  size: string       // Human-readable
  sizeBytes: number  // Bytes
  type: string       // MIME type
}
```

## Examples

### Browse Templates

```javascript
const response = await fetch('http://localhost:4876/api/templates/books')
const data = await response.json()

console.log('Available templates:', data.templates.length)
data.templates.forEach(t => {
  console.log(`- ${t.name} (${t.category})`)
})
```

### Get Template Details

```javascript
const response = await fetch(
  `http://localhost:4876/api/templates/books/${templateId}`
)
const data = await response.json()

console.log('Template:', data.template.name)
console.log('Pages:', data.template.pages.length)
console.log('Demo images:', data.template.demoImages.length)
```

### Clone Template

```javascript
const response = await fetch(
  `http://localhost:4876/api/templates/books/${templateId}/clone`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const data = await response.json()
console.log('Created book:', data.book.id)
console.log('Title:', data.book.title)
```

### Create Template (Admin)

```javascript
const response = await fetch('http://localhost:4876/api/templates/books', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: `template-${Date.now()}`,
    name: 'My Template',
    description: 'A custom template',
    category: 'magazine',
    price: 0,
    thumbnail: 'http://...',
    tags: ['custom'],
    config: { ... },
    pages: [ ... ],
    demoImages: [ ... ],
    metadata: {
      author: 'Admin',
      version: '1.0',
      createdAt: new Date().toISOString()
    }
  })
})
```

## Template Creation Workflow

### 1. Design in Editor

1. Create a new project
2. Design your template layout
3. Add demo images
4. Add text elements
5. Style everything

### 2. Publish as Template

1. Click "Publish Template" (admin only)
2. Fill in metadata:
   - Name
   - Description
   - Category
   - Tags
3. Upload thumbnail
4. Set price (0 for free)
5. Submit

### 3. Backend Processing

Backend automatically:
- Saves template with demo images
- Locks all text elements
- Preserves slot positions and styling
- Generates unique template ID

### 4. User Clones Template

When user clones:
- Creates new book in user's library
- Strips demo images from slots
- Unlocks text elements
- Preserves layout and styling

## Related

- [Books API](./books.md) - Manage cloned books
- [Uploads API](./uploads.md) - Upload demo images
- [Admin API](./admin.md) - Admin template management

---

[← Back to API Overview](./overview.md)
