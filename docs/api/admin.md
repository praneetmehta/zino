# Admin API

Administrative endpoints for system management.

**All endpoints require admin authentication.**

## Endpoints

### GET /api/admin/stats

Get system-wide statistics and analytics.

**Authentication**: Required (Admin only)

**Request**:
```http
GET /api/admin/stats HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "totalBooks": 156,
  "totalTemplates": 12,
  "totalUploads": 487,
  "totalOrders": 0,
  "totalUsers": 45,
  "storageUsed": "1.2 GB",
  "storageUsedBytes": 1288490188,
  "storageBreakdown": {
    "books": "450 MB",
    "uploads": "750 MB",
    "templates": "50 MB"
  },
  "booksByDate": {
    "2024-01-01": 5,
    "2024-01-02": 8,
    "2024-01-03": 12
  },
  "templateUsage": {
    "template-123": 45,
    "template-456": 23
  },
  "recentBooks": [
    {
      "id": "book-1704067200000",
      "title": "My Zine",
      "userId": "user_123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "pageCount": 8
    }
  ],
  "recentOrders": []
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

### GET /api/admin/books

List all books from all users.

**Authentication**: Required (Admin only)

**Request**:
```http
GET /api/admin/books HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "books": [
    {
      "id": "book-1704067200000",
      "userId": "user_123",
      "title": "My Zine",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "fileSize": "2.5 MB",
      "fileSizeBytes": 2621440,
      "lastModified": "2024-01-01T12:00:00.000Z",
      "data": {
        "zineConfig": { ... },
        "pages": [ ... ],
        "mediaAssets": [ ... ]
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
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

### DELETE /api/admin/books/:id

Delete any book (regardless of owner).

**Authentication**: Required (Admin only)

**Parameters**:
- `id` (path) - Book ID

**Request**:
```http
DELETE /api/admin/books/book-1704067200000 HTTP/1.1
Authorization: Bearer <admin_token>
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
- `403 Forbidden` - Not an admin
- `404 Not Found` - Book doesn't exist
- `500 Internal Server Error` - Server error

---

### GET /api/admin/templates

List all templates.

**Authentication**: Required (Admin only)

**Request**:
```http
GET /api/admin/templates HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "template-1704067200000",
      "name": "Magazine Layout",
      "description": "Modern magazine-style layout",
      "category": "magazine",
      "price": 0,
      "thumbnail": "http://localhost:4876/uploads/template-thumb.jpg",
      "tags": ["magazine", "modern"],
      "fileSize": "1.5 MB",
      "fileSizeBytes": 1572864,
      "lastModified": "2024-01-01T00:00:00.000Z",
      "metadata": {
        "author": "Admin User",
        "version": "1.0",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

### DELETE /api/admin/templates/:id

Delete a template.

**Authentication**: Required (Admin only)

**Parameters**:
- `id` (path) - Template ID

**Request**:
```http
DELETE /api/admin/templates/template-1704067200000 HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `404 Not Found` - Template doesn't exist
- `500 Internal Server Error` - Server error

---

### GET /api/admin/uploads

List all uploaded files.

**Authentication**: Required (Admin only)

**Request**:
```http
GET /api/admin/uploads HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "uploads": [
    {
      "name": "upload-1704067200000-abc123.jpg",
      "size": "2.5 MB",
      "sizeBytes": 2621440,
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

### DELETE /api/admin/uploads/:filename

Delete any uploaded file.

**Authentication**: Required (Admin only)

**Parameters**:
- `filename` (path) - Filename to delete

**Request**:
```http
DELETE /api/admin/uploads/upload-1704067200000-abc123.jpg HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `404 Not Found` - File doesn't exist
- `500 Internal Server Error` - Server error

---

### GET /api/admin/system

Get system information and health status.

**Authentication**: Required (Admin only)

**Request**:
```http
GET /api/admin/system HTTP/1.1
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "nodeVersion": "v18.17.0",
  "platform": "linux",
  "environment": "production",
  "memory": {
    "heapUsed": "45.2 MB",
    "heapTotal": "89.5 MB",
    "rss": "120.3 MB"
  },
  "uptime": "5d 12h 34m",
  "uptimeSeconds": 475440,
  "volumePath": "/data"
}
```

**Errors**:
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Not an admin
- `500 Internal Server Error` - Server error

---

## Admin Dashboard

The admin dashboard provides a visual interface for these endpoints.

### Access

Navigate to `/zino/admin` (requires admin login).

### Features

**Overview Tab**:
- System statistics cards
- Books created over time chart
- Storage breakdown
- Recent books table

**Books Tab**:
- List all books with details
- Delete books
- Refresh data

**Templates Tab**:
- List all templates
- Delete templates
- View template details

**Uploads Tab**:
- List all uploaded files
- Delete files
- View file sizes and dates

**Image Analytics Tab**:
- Total images statistics
- Images per book
- Format distribution
- Largest images

**System Tab**:
- Node version and platform
- Memory usage
- Server uptime
- Volume path

## Admin Promotion

### Auto-Promotion

Specific email addresses are auto-promoted to admin on login:

```javascript
// server/routes/auth.js
if (user.email === 'praneet.mehta@gmail.com') {
  user.role = 'admin'
}
```

### Manual Promotion

Update user role in database:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

Or use the User model:

```javascript
await User.updateRole(userId, 'admin')
```

## Examples

### Get System Stats

```javascript
const response = await fetch('http://localhost:4876/api/admin/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})

const stats = await response.json()
console.log('Total books:', stats.totalBooks)
console.log('Storage used:', stats.storageUsed)
```

### List All Books

```javascript
const response = await fetch('http://localhost:4876/api/admin/books', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})

const data = await response.json()
console.log('All books:', data.books.length)
```

### Delete a Book

```javascript
const response = await fetch(
  `http://localhost:4876/api/admin/books/${bookId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
)

const result = await response.json()
console.log('Deleted:', result.success)
```

### Get System Info

```javascript
const response = await fetch('http://localhost:4876/api/admin/system', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})

const info = await response.json()
console.log('Node version:', info.nodeVersion)
console.log('Memory used:', info.memory.heapUsed)
console.log('Uptime:', info.uptime)
```

## Security

### Authentication

All admin endpoints require:
1. Valid JWT token
2. User role set to 'admin'

### Authorization Check

```javascript
// server/routes/admin.js
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
```

### Audit Logging

Future enhancement: Log all admin actions for audit trail.

## Monitoring

### Health Checks

Use `/health` endpoint for monitoring:

```bash
curl http://localhost:4876/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 475440
}
```

### Metrics

Future enhancements:
- Request rate metrics
- Error rate tracking
- Performance monitoring
- Resource usage alerts

## Related

- [Books API](./books.md) - Book management
- [Templates API](./templates.md) - Template management
- [Uploads API](./uploads.md) - Upload management
- [Authentication](../getting-started/oauth-setup.md) - Admin setup

---

[← Back to API Overview](./overview.md)
