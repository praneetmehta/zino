# Books API

Manage user zine projects (books).

## Endpoints

### GET /api/books

List all books for the authenticated user.

**Authentication**: Required

**Request**:
```http
GET /api/books HTTP/1.1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "books": [
    {
      "id": "book-1704067200000",
      "userId": "user_123",
      "title": "My First Zine",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "data": {
        "zineConfig": {
          "width": 8.5,
          "height": 11,
          "unit": "in",
          "bleed": 0.125,
          "margin": 0.5,
          "bindingType": "folded",
          "gutter": 0.25
        },
        "pages": [...],
        "mediaAssets": [...]
      },
      "metadata": {
        "pageCount": 8
      }
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `500 Internal Server Error` - Server error

---

### GET /api/books/:id

Get a specific book by ID.

**Authentication**: Required  
**Authorization**: User must own the book or be admin

**Parameters**:
- `id` (path) - Book ID

**Request**:
```http
GET /api/books/book-1704067200000 HTTP/1.1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "book-1704067200000",
  "userId": "user_123",
  "title": "My First Zine",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "data": {
    "zineConfig": {
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
        "layout": "two-column",
        "tag": "1-left + 2-right",
        "slots": [
          {
            "id": "slot-1",
            "x": 0,
            "y": 0,
            "width": 50,
            "height": 100,
            "type": "image",
            "assetId": "image-123.jpg",
            "fit": "cover",
            "backgroundColor": null,
            "imageOffsetX": 50,
            "imageOffsetY": 50,
            "innerMarginPx": 0,
            "zIndex": 0
          }
        ],
        "textElements": [
          {
            "id": "text-1",
            "type": "text",
            "content": "Hello World",
            "x": 10,
            "y": 10,
            "width": 200,
            "height": 50,
            "locked": false,
            "style": {
              "fontSize": 24,
              "fontFamily": "Arial",
              "color": "#000000",
              "textAlign": "left"
            }
          }
        ]
      }
    ],
    "mediaAssets": [
      {
        "id": "image-123.jpg",
        "name": "photo.jpg",
        "url": "http://localhost:4876/uploads/image-123.jpg",
        "size": "2.5 MB",
        "sizeBytes": 2621440,
        "type": "image/jpeg",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "metadata": {
    "pageCount": 8
  }
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - User doesn't own this book
- `404 Not Found` - Book doesn't exist
- `500 Internal Server Error` - Server error

---

### POST /api/books

Create a new book or update an existing one.

**Authentication**: Required

**Request Body**:
```json
{
  "id": "book-1704067200000",  // Optional for new, required for update
  "title": "My First Zine",
  "data": {
    "zineConfig": {
      "width": 8.5,
      "height": 11,
      "unit": "in",
      "bleed": 0.125,
      "margin": 0.5,
      "bindingType": "folded",
      "gutter": 0.25
    },
    "pages": [...],
    "mediaAssets": [...]
  }
}
```

**Request**:
```http
POST /api/books HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Zine",
  "data": { ... }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "book": {
    "id": "book-1704067200000",
    "userId": "user_123",
    "title": "My First Zine",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "data": { ... }
  }
}
```

**Validation Rules**:
- `title` - Required, string, max 200 characters
- `data` - Required, object
- `data.zineConfig` - Required, valid config object
- `data.pages` - Required, array

**Errors**:
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Trying to update someone else's book
- `500 Internal Server Error` - Server error

---

### DELETE /api/books/:id

Delete a book.

**Authentication**: Required  
**Authorization**: User must own the book or be admin

**Parameters**:
- `id` (path) - Book ID

**Request**:
```http
DELETE /api/books/book-1704067200000 HTTP/1.1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - User doesn't own this book
- `404 Not Found` - Book doesn't exist
- `500 Internal Server Error` - Server error

---

## Book Structure

### ZineConfig

Configuration for the zine dimensions and layout.

```typescript
{
  width: number          // Page width
  height: number         // Page height
  unit: string          // 'in', 'mm', or 'px'
  bleed: number         // Bleed margin
  margin: number        // Content margin
  bindingType: string   // 'folded', 'flat', or 'stapled'
  gutter: number        // Gutter width (for folded binding)
}
```

### Page

A single page in the zine.

```typescript
{
  id: string                    // Unique page ID
  layout: string                // Layout type
  tag: string                   // Page label/tag
  slots: Slot[]                 // Image slots
  textElements: TextElement[]   // Text elements
  marginOverride?: number       // Optional page-specific margin
}
```

### Slot

An image placeholder on a page.

```typescript
{
  id: string              // Unique slot ID
  x: number              // X position (%)
  y: number              // Y position (%)
  width: number          // Width (%)
  height: number         // Height (%)
  type: 'image'          // Always 'image'
  assetId: string | null // Reference to media asset
  fit: string            // 'cover' or 'contain'
  backgroundColor: string | null  // Optional background color
  imageOffsetX: number   // Image position X (0-100%)
  imageOffsetY: number   // Image position Y (0-100%)
  innerMarginPx: number  // Inner margin in pixels
  zIndex: number         // Layer order
}
```

### TextElement

A text box on a page.

```typescript
{
  id: string       // Unique text element ID
  type: 'text'     // Always 'text'
  content: string  // Text content
  x: number        // X position (px)
  y: number        // Y position (px)
  width: number    // Width (px)
  height: number   // Height (px)
  locked: boolean  // Whether element is locked
  style: {
    fontSize: number
    fontFamily: string
    color: string
    textAlign: 'left' | 'center' | 'right'
    fontWeight: string
    fontStyle: string
  }
}
```

### MediaAsset

An uploaded image file.

```typescript
{
  id: string         // Filename
  name: string       // Original filename
  url: string        // Full URL to image
  size: string       // Human-readable size
  sizeBytes: number  // Size in bytes
  type: string       // MIME type
  uploadedAt: string // ISO 8601 timestamp
}
```

## Examples

### Create a New Book

```javascript
const response = await fetch('http://localhost:4876/api/books', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Zine',
    data: {
      zineConfig: {
        width: 8.5,
        height: 11,
        unit: 'in',
        bleed: 0.125,
        margin: 0.5,
        bindingType: 'folded',
        gutter: 0.25
      },
      pages: [],
      mediaAssets: []
    }
  })
})

const data = await response.json()
console.log('Created book:', data.book.id)
```

### Update an Existing Book

```javascript
const response = await fetch('http://localhost:4876/api/books', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 'book-1704067200000',  // Include ID to update
    title: 'My Updated Zine',
    data: { ... }
  })
})
```

### List All Books

```javascript
const response = await fetch('http://localhost:4876/api/books', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
console.log('Books:', data.books)
```

### Delete a Book

```javascript
const response = await fetch(`http://localhost:4876/api/books/${bookId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
console.log('Deleted:', data.success)
```

## Related

- [Templates API](./templates.md) - Clone templates to create books
- [Uploads API](./uploads.md) - Upload images for books
- [Admin API](./admin.md) - Admin book management

---

[← Back to API Overview](./overview.md)
