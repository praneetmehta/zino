# API Reference

Complete REST API documentation for Zino backend.

## Base URL

- **Development**: `http://localhost:4876`
- **Production**: `https://your-backend.railway.app`

## Authentication

Most endpoints require authentication via JWT token.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token

See [Authentication API](./auth.md) for login endpoints.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Optional detailed error info"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. May be added in future versions.

## API Endpoints

### Authentication
- [POST /auth/google](./auth.md#post-authgoogle) - Google OAuth login
- [GET /auth/me](./auth.md#get-authme) - Get current user
- [POST /auth/logout](./auth.md#post-authlogout) - Logout

### Books
- [GET /api/books](./books.md#get-apibooks) - List user's books
- [GET /api/books/:id](./books.md#get-apibooksid) - Get specific book
- [POST /api/books](./books.md#post-apibooks) - Create/update book
- [DELETE /api/books/:id](./books.md#delete-apibooksid) - Delete book

### Templates
- [GET /api/templates/books](./templates.md#get-apitemplatesbooks) - List templates
- [GET /api/templates/books/:id](./templates.md#get-apitemplatesbooksid) - Get template
- [POST /api/templates/books/:id/clone](./templates.md#post-apitemplatesbooksidclone) - Clone template
- [POST /api/templates/books](./templates.md#post-apitemplatesbooks) - Create template (admin)

### Uploads
- [POST /api/uploads](./uploads.md#post-apiuploads) - Upload file
- [GET /api/uploads/:filename](./uploads.md#get-apiuploadsfilename) - Get file
- [DELETE /api/uploads/:filename](./uploads.md#delete-apiuploadsfilename) - Delete file

### Admin
- [GET /api/admin/stats](./admin.md#get-apiadminstats) - System statistics
- [GET /api/admin/books](./admin.md#get-apiadminbooks) - All books
- [GET /api/admin/templates](./admin.md#get-apiadmintemplates) - All templates
- [GET /api/admin/uploads](./admin.md#get-apiadminuploads) - All uploads
- [GET /api/admin/system](./admin.md#get-apiadminsystem) - System info
- [DELETE /api/admin/books/:id](./admin.md#delete-apiadminbooksid) - Delete any book
- [DELETE /api/admin/templates/:id](./admin.md#delete-apiadmintemplatesid) - Delete template
- [DELETE /api/admin/uploads/:filename](./admin.md#delete-apiadminuploadsfilename) - Delete upload

### Health Check
- [GET /health](./health.md) - Server health status

## Data Models

### User

```typescript
{
  id: string
  email: string
  name: string
  avatar: string
  role: 'user' | 'admin'
  createdAt: string (ISO 8601)
  lastLoginAt: string (ISO 8601)
}
```

### Book

```typescript
{
  id: string
  userId: string
  title: string
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  data: {
    zineConfig: {
      width: number
      height: number
      unit: 'in' | 'mm' | 'px'
      bleed: number
      margin: number
      bindingType: 'folded' | 'flat' | 'stapled'
      gutter: number
    }
    pages: Page[]
    mediaAssets: MediaAsset[]
  }
  metadata: {
    pageCount: number
    isFromTemplate?: boolean
    templateId?: string
  }
}
```

### Page

```typescript
{
  id: string
  layout: string
  tag: string
  slots: Slot[]
  textElements: TextElement[]
  marginOverride?: number
}
```

### Slot

```typescript
{
  id: string
  x: number
  y: number
  width: number
  height: number
  type: 'image'
  assetId: string | null
  fit: 'cover' | 'contain'
  backgroundColor: string | null
  imageOffsetX: number (0-100)
  imageOffsetY: number (0-100)
  innerMarginPx: number
  zIndex: number
}
```

### TextElement

```typescript
{
  id: string
  type: 'text'
  content: string
  x: number
  y: number
  width: number
  height: number
  locked: boolean
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

```typescript
{
  id: string
  name: string
  url: string
  size: string
  sizeBytes: number
  type: string
  uploadedAt: string (ISO 8601)
}
```

### Template

```typescript
{
  id: string
  name: string
  description: string
  category: string
  price: number
  thumbnail: string
  tags: string[]
  config: ZineConfig
  pages: Page[]
  demoImages: MediaAsset[]
  metadata: {
    author: string
    version: string
    createdAt: string (ISO 8601)
  }
}
```

## Common Patterns

### Pagination

Not currently implemented. All list endpoints return full results.

Future implementation:
```
GET /api/books?page=1&limit=20
```

### Filtering

Not currently implemented.

Future implementation:
```
GET /api/books?category=magazine&sort=createdAt
```

### Sorting

Not currently implemented.

Future implementation:
```
GET /api/books?sort=createdAt&order=desc
```

## Error Handling

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Authentication Errors

```json
{
  "error": "Authentication required"
}
```

```json
{
  "error": "Token expired"
}
```

### Authorization Errors

```json
{
  "error": "Admin access required"
}
```

### Not Found Errors

```json
{
  "error": "Book not found"
}
```

## CORS

The API supports CORS for allowed origins configured via `CORS_ORIGIN` environment variable.

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers**: Content-Type, Authorization

## File Uploads

File uploads use `multipart/form-data` encoding.

**Max File Size**: 10MB (configurable)  
**Allowed Types**: Images (jpg, png, gif, webp, svg)

## Webhooks

Not currently implemented.

## Versioning

API versioning not currently implemented. Breaking changes will be documented in release notes.

## SDKs & Client Libraries

No official SDKs yet. Use standard HTTP clients:

- **JavaScript**: fetch, axios
- **Python**: requests
- **cURL**: Command line testing

## Testing

Use the provided Postman collection (coming soon) or test with cURL:

```bash
# Get books
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4876/api/books

# Create book
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Zine","data":{...}}' \
  http://localhost:4876/api/books
```

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Main Docs](../README.md)

---

**Next**: Explore specific endpoint documentation:
- [Authentication API](./auth.md)
- [Books API](./books.md)
- [Templates API](./templates.md)
- [Uploads API](./uploads.md)
- [Admin API](./admin.md)
