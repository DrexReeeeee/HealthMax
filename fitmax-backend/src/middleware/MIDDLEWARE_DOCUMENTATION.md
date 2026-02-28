# Middleware

This folder contains Express middleware functions for authentication and request processing.

## Files Overview

### authMiddleware.js
JWT authentication middleware that ensures only authenticated users can access protected routes.

**Function:**
```
javascript
const authMiddleware = (req, res, next) => {
    // Validates JWT token from Authorization header
    // Sets req.userId and req.isAdmin on success
    // Returns 401 if token is missing or invalid
}
```

**Usage:**
- Used for routes that require mandatory authentication
- Adds `req.userId` to the request object
- Adds `req.isAdmin` to check admin privileges

**Implementation Details:**
1. Extracts token from `Authorization` header (Bearer token format)
2. Verifies token using `jsonwebtoken`
3. Decodes payload to get user ID and admin status
4. Attaches user info to request object

**Example Usage:**
```
javascript
const authMiddleware = require('./middleware/authMiddleware');

router.get('/profile', authMiddleware, getProfile);
```

---

### optionalAuth.js
Optional authentication middleware that allows both authenticated and guest users.

**Function:**
```
javascript
const optionalAuth = (req, res, next) => {
    // If token provided and valid, sets req.userId and req.isAdmin
    // If no token or invalid, continues as guest (req.userId = undefined)
    // Never blocks requests - always calls next()
}
```

**Usage:**
- Used for routes that should work for both guests and logged-in users
- Enables personalized experience for logged-in users
- Falls back to generic/guest mode if not authenticated

**Implementation Details:**
1. Checks for `Authorization` header
2. If present, attempts to verify and decode JWT
3. If verification fails, logs message and continues as guest
4. If not present, continues as guest
5. Always calls `next()` to proceed with request

**Example Usage:**
```
javascript
const optionalAuth = require('./middleware/optionalAuth');

router.get('/product/:barcode', optionalAuth, getProduct);
```

---

## Authentication Flow

### Required Authentication (authMiddleware)
```
Client Request → Check Token → Valid? 
    → Yes: Attach user to request → Route Handler
    → No: Return 401 Unauthorized
```

### Optional Authentication (optionalAuth)
```
Client Request → Check Token → Valid? 
    → Yes: Attach user to request → Route Handler (Personalized)
    → No/Missing: Continue as guest → Route Handler (Generic)
```

## Token Structure

The JWT token contains the following payload:
```
json
{
    "id": 1,
    "is_admin": false
}
```

**Token Generation:**
- Secret key from `JWT_SECRET` environment variable
- Expiration: 7 days

## Sample Test Payloads

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```
bash
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3MDQwNjUyMDB9.example
```

### Testing authMiddleware (Protected Route)

```
bash
# Without token - Should return 401
curl -X GET http://localhost:5000/api/profile

# With invalid token - Should return 401
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer invalid_token_here"
```

### Testing optionalAuth (Flexible Route)

```
bash
# Without token - Should work (guest mode)
curl -X GET http://localhost:5000/api/product/5000159484695

# With valid token - Should work (personalized)
curl -X GET http://localhost:5000/api/product/5000159484695 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# With invalid token - Should still work (guest mode)
curl -X GET http://localhost:5000/api/product/5000159484695 \
  -H "Authorization: Bearer invalid_token"
```

---

## Error Responses

### authMiddleware Errors

Missing Token:
```
json
{
    "success": false,
    "message": "No token provided"
}
```

Invalid Token:
```
json
{
    "success": false,
    "message": "Invalid token"
}
```

### optionalAuth Behavior

Invalid Token (logs but continues):
```
Invalid token, continuing as guest
```
Request proceeds with `req.userId = undefined`
