# Uploads API

Upload and manage media files (images).

## Endpoints

### POST /api/uploads

Upload a new file.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request**:
```http
POST /api/uploads HTTP/1.1
Authorization: Bearer <token>
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary--
```

**Response** (200 OK):
```json
{
  "success": true,
  "file": {
    "id": "upload-1704067200000-abc123.jpg",
    "name": "photo.jpg",
    "url": "http://localhost:4876/uploads/upload-1704067200000-abc123.jpg",
    "size": "2.5 MB",
    "sizeBytes": 2621440,
    "type": "image/jpeg",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**File Constraints**:
- **Max Size**: 10 MB (configurable via `VITE_MAX_UPLOAD_SIZE`)
- **Allowed Types**: 
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`
  - `image/svg+xml`

**Errors**:
- `400 Bad Request` - No file provided or invalid file type
- `401 Unauthorized` - No/invalid token
- `413 Payload Too Large` - File exceeds max size
- `500 Internal Server Error` - Server error

---

### GET /api/uploads/:filename

Get an uploaded file.

**Authentication**: Not required (public access)

**Parameters**:
- `filename` (path) - Filename returned from upload

**Request**:
```http
GET /api/uploads/upload-1704067200000-abc123.jpg HTTP/1.1
```

**Response** (200 OK):
- Returns the file with appropriate `Content-Type` header
- Browser will display/download the image

**Errors**:
- `404 Not Found` - File doesn't exist
- `500 Internal Server Error` - Server error

---

### DELETE /api/uploads/:filename

Delete an uploaded file.

**Authentication**: Required  
**Authorization**: User must own the file or be admin

**Parameters**:
- `filename` (path) - Filename to delete

**Request**:
```http
DELETE /api/uploads/upload-1704067200000-abc123.jpg HTTP/1.1
Authorization: Bearer <token>
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
- `403 Forbidden` - User doesn't own this file
- `404 Not Found` - File doesn't exist
- `500 Internal Server Error` - Server error

---

## File Upload Details

### Filename Generation

Uploaded files are renamed to prevent conflicts:

```
Format: upload-{timestamp}-{random}.{extension}
Example: upload-1704067200000-abc123.jpg
```

### Storage Location

**Development** (Filesystem):
```
server/data/uploads/
```

**Production** (S3 or Filesystem):
- Configured via `STORAGE_PROVIDER` environment variable
- Filesystem: Railway volume at `/data/uploads`
- S3: AWS S3 bucket

### URL Structure

**Development**:
```
http://localhost:4876/uploads/{filename}
```

**Production**:
```
https://your-backend.railway.app/uploads/{filename}
```

Or with custom domain:
```
https://api.yourdomain.com/uploads/{filename}
```

### File Metadata

Each uploaded file includes:

```typescript
{
  id: string         // Unique filename
  name: string       // Original filename
  url: string        // Full URL to access file
  size: string       // Human-readable size (e.g., "2.5 MB")
  sizeBytes: number  // Size in bytes
  type: string       // MIME type
  uploadedAt: string // ISO 8601 timestamp
}
```

## Examples

### Upload File (JavaScript)

```javascript
// Using FormData
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('http://localhost:4876/api/uploads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

const data = await response.json()
console.log('Uploaded:', data.file.url)
```

### Upload File (cURL)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/photo.jpg" \
  http://localhost:4876/api/uploads
```

### Upload with Drag & Drop

```javascript
// Handle drop event
dropZone.addEventListener('drop', async (e) => {
  e.preventDefault()
  
  const files = e.dataTransfer.files
  for (const file of files) {
    await uploadFile(file)
  }
})

async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  const data = await response.json()
  return data.file
}
```

### Delete File

```javascript
const response = await fetch(
  `http://localhost:4876/api/uploads/${filename}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const data = await response.json()
console.log('Deleted:', data.success)
```

### Display Uploaded Image

```html
<img src="http://localhost:4876/uploads/upload-1704067200000-abc123.jpg" 
     alt="Uploaded image">
```

## Upload Progress

Track upload progress using `XMLHttpRequest`:

```javascript
function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)
    
    // Track progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100
        onProgress(percent)
      }
    })
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('Upload failed'))
      }
    })
    
    // Send request
    xhr.open('POST', '/api/uploads')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(formData)
  })
}

// Usage
await uploadWithProgress(file, (percent) => {
  console.log(`Upload progress: ${percent}%`)
})
```

## Image Optimization

### Client-Side Optimization

Resize images before upload to reduce file size:

```javascript
async function resizeImage(file, maxWidth = 1920) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * ratio
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Usage
const resized = await resizeImage(originalFile)
await uploadFile(resized)
```

### Server-Side Optimization

Currently not implemented. Future enhancement:
- Automatic image resizing
- Format conversion
- Thumbnail generation

## Security

### File Validation

Backend validates:
- File type (MIME type)
- File size
- File extension

### Access Control

- Upload requires authentication
- Delete requires ownership or admin role
- Read is public (files served directly)

### Storage Security

**Filesystem**:
- Files stored outside web root
- Served through Express middleware
- No directory listing

**S3**:
- Private bucket with signed URLs
- Access controlled via IAM
- Optional CDN (CloudFront)

## Troubleshooting

### "File too large" Error

Increase max file size:

```env
# Frontend
VITE_MAX_UPLOAD_SIZE=20971520  # 20MB in bytes

# Backend (if using body parser)
JSON_BODY_LIMIT=20mb
```

### "Invalid file type" Error

Check allowed types in `server/src/index.js`:

```javascript
const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]
```

### Upload Fails Silently

Check:
1. Token is valid
2. File size within limit
3. File type is allowed
4. Network connection
5. Server logs for errors

## Related

- [Books API](./books.md) - Use uploaded images in books
- [Templates API](./templates.md) - Use images in templates
- [Admin API](./admin.md) - Admin upload management

---

[← Back to API Overview](./overview.md)
