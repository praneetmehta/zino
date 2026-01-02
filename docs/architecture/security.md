# API Security Documentation

## Overview

Zino implements comprehensive security measures to protect user data and prevent unauthorized access.

## Authentication

### JWT-Based Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Token Contents:**
```javascript
{
  id: string,      // User ID
  email: string,   // User email
  role: string,    // 'user' or 'admin'
  iat: number,     // Issued at (timestamp)
  exp: number      // Expires at (timestamp)
}
```

**Token Expiry:** 24 hours (configurable)

### Development Mode

Set `SKIP_AUTH=true` to bypass authentication in development:

```env
SKIP_AUTH=true
```

This creates a temporary admin user for testing.

## Authorization Middleware

### authenticateJWT

Validates JWT token and populates `req.user`.

**Usage:**
```javascript
app.get('/protected', authenticateJWT, (req, res) => {
  // req.user is available
})
```

**Responses:**
- `401` - No token provided
- `401` - Token expired
- `403` - Invalid token

### requireAdmin

Ensures user has admin role.

**Usage:**
```javascript
app.get('/admin/stats', authenticateJWT, requireAdmin, (req, res) => {
  // Only admins can access
})
```

**Responses:**
- `401` - Not authenticated
- `403` - Not an admin

### requireOwnership

Validates that the user owns the resource being accessed.

**Usage:**
```javascript
app.get('/books/:id', 
  authenticateJWT, 
  requireOwnership(async (req) => {
    const book = await getBook(req.params.id)
    return book.userId
  }),
  (req, res) => {
    // User owns this book or is admin
  }
)
```

**Features:**
- Admins bypass ownership checks
- Returns 404 if resource not found
- Returns 403 if user doesn't own resource

**Responses:**
- `401` - Not authenticated
- `403` - Access denied (not owner)
- `404` - Resource not found

### requireSelf

Ensures users can only access their own user data.

**Usage:**
```javascript
app.get('/users/:userId', authenticateJWT, requireSelf, (req, res) => {
  // req.params.userId must match req.user.id
})
```

**Responses:**
- `401` - Not authenticated
- `403` - Access denied

### optionalAuth

Populates `req.user` if token provided, but doesn't fail if missing.

**Usage:**
```javascript
app.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    // User is logged in
  } else {
    // Anonymous access
  }
})
```

## Endpoint Security

### Books API

| Endpoint | Auth | Ownership | Notes |
|----------|------|-----------|-------|
| GET /books | Required | User's books only | Admins see all |
| GET /books/:id | Required | Owner only | Admins can access any |
| POST /books | Required | Owner only (updates) | Creates with req.user.id |
| DELETE /books/:id | Required | Owner only | Admins can delete any |

### Custom Layouts API

| Endpoint | Auth | Ownership | Notes |
|----------|------|-----------|-------|
| GET /layouts/custom | Required | User's layouts only | Admins see all |
| POST /layouts/custom | Required | Creates with req.user.id | |
| DELETE /layouts/custom/:id | Required | Owner only | Admins can delete any |

### Templates API

| Endpoint | Auth | Ownership | Notes |
|----------|------|-----------|-------|
| GET /api/templates/books | Optional | Public | Anyone can browse |
| GET /api/templates/books/:id | Optional | Public | Anyone can view |
| POST /api/templates/books/:id/clone | Required | Creates user's copy | |
| POST /api/templates/books | Required | Admin only | Create templates |

### Uploads API

| Endpoint | Auth | Ownership | Notes |
|----------|------|-----------|-------|
| POST /api/uploads | Required | Uploads as req.user.id | |
| GET /api/uploads/:filename | None | Public | Files are public |
| DELETE /api/uploads/:filename | Required | Owner or admin | |

### Admin API

| Endpoint | Auth | Admin | Notes |
|----------|------|-------|-------|
| GET /api/admin/stats | Required | Yes | System statistics |
| GET /api/admin/books | Required | Yes | All books |
| GET /api/admin/templates | Required | Yes | All templates |
| GET /api/admin/uploads | Required | Yes | All uploads |
| GET /api/admin/system | Required | Yes | System info |
| DELETE /api/admin/* | Required | Yes | Delete any resource |

## Security Best Practices

### 1. User ID Enforcement

User IDs are **always** taken from the JWT token, never from request body:

```javascript
// ❌ WRONG - User can spoof userId
const userId = req.body.userId

// ✅ CORRECT - userId from JWT
const userId = req.user.id
```

### 2. Ownership Validation

Always verify ownership before modifying resources:

```javascript
// Check ownership
const book = await getBook(bookId)
if (book.userId !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Access denied' })
}
```

### 3. Admin Bypass

Admins can access all resources:

```javascript
if (req.user.role === 'admin') {
  // Skip ownership checks
  return next()
}
```

### 4. Input Validation

Validate all user input:

```javascript
if (!id || !title || !data) {
  return res.status(400).json({ error: 'Missing required fields' })
}
```

## Error Responses

### 401 Unauthorized

Authentication required but not provided:

```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Token expired"
}
```

### 403 Forbidden

Authenticated but insufficient permissions:

```json
{
  "error": "Access denied"
}
```

```json
{
  "error": "Admin access required"
}
```

### 404 Not Found

Resource doesn't exist:

```json
{
  "error": "Book not found"
}
```

## Admin Promotion

### Auto-Promotion

Specific emails are auto-promoted to admin on login:

```javascript
// server/routes/auth.js
if (user.email === 'praneet.mehta@gmail.com') {
  user.role = 'admin'
}
```

### Manual Promotion

Update user role in database:

```javascript
await User.updateRole(userId, 'admin')
```

Or via SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

## Security Headers

### CORS Configuration

CORS is configured to allow specific origins:

```javascript
// Development
CORS_ORIGIN=http://localhost:3000

// Production
CORS_ORIGIN=https://yourdomain.com
```

Multiple origins:

```javascript
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Content Security

- JSON body size limit: 150MB (configurable)
- File upload size limit: 10MB (configurable)
- Allowed file types: Images only (jpg, png, gif, webp, svg)

## Audit Logging

### Authentication Events

Logged events:
- Login attempts (success/failure)
- Token validation failures
- Admin promotions

### Authorization Events

Logged events:
- Ownership check failures
- Admin access attempts
- Resource access denials

### Admin Actions

Logged events:
- Book deletions
- Template deletions
- Upload deletions
- System info access

## Future Enhancements

### Planned Security Features

1. **Rate Limiting**
   - Limit requests per IP
   - Stricter limits for auth endpoints
   - Prevent brute force attacks

2. **Security Headers**
   - Helmet.js integration
   - CSRF protection
   - XSS prevention headers

3. **Enhanced Validation**
   - Request schema validation
   - Input sanitization
   - SQL injection prevention

4. **Session Management**
   - Token refresh mechanism
   - Session revocation
   - Multi-device management

5. **Audit Trail**
   - Complete action logging
   - Admin activity dashboard
   - Security event alerts

## Testing Security

### Test Authentication

```bash
# Without token (should fail)
curl http://localhost:4876/books

# With token (should succeed)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4876/books
```

### Test Ownership

```bash
# Try to access another user's book (should fail)
curl -H "Authorization: Bearer USER1_TOKEN" \
  http://localhost:4876/books/USER2_BOOK_ID
```

### Test Admin Access

```bash
# Admin accessing any book (should succeed)
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:4876/books/ANY_BOOK_ID
```

## Related Documentation

- [API Overview](./api/overview.md)
- [Authentication Setup](./getting-started/oauth-setup.md)
- [Admin API](./api/admin.md)

---

*Last updated: January 2026*
