# Routes

This folder contains all Express router configurations that define API endpoints. Each route file maps URL paths to controller functions.

## Files Overview

### authRoutes.js
Handles user authentication endpoints.

**Base Path:** `/api/auth`

**Routes:**
| Method | Endpoint | Handler | Access | Description |
|--------|----------|---------|--------|-------------|
| POST | `/register` | `register` | Public | Register new user |
| POST | `/login` | `login` | Public | Login user |

**Sample Test Payloads:**

Register User:
```bash
POST /api/auth/register
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123",
    "username": "johndoe",
    "age": 30,
    "weight": 75.5,
    "diet_plan_id": 1
}
```

Login:
```
bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response (Register):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "johndoe",
    "is_admin": false
}
```

**Response (Login):**
```
json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "johndoe",
    "is_admin": false
}
```

---

### profileRoutes.js
Handles user profile management endpoints.

**Base Path:** `/api/profile`

**Routes:**
| Method | Endpoint | Handler | Access | Description |
|--------|----------|---------|--------|-------------|
| GET | `/` | `getProfile` | Authenticated | Get user profile |
| POST | `/` | `saveProfile` | Authenticated | Save/update profile |

**Sample Test Payloads:**

Get Profile:
```
bash
GET /api/profile
Authorization: Bearer <your_jwt_token>
```

Save Profile:
```
bash
POST /api/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
    "username": "johndoe",
    "age": 31,
    "weight": 74.5,
    "diet_plan_id": 2
}
```

**Response (Get Profile):**
```
json
{
    "success": true,
    "profile": {
        "id": 1,
        "user_id": 1,
        "username": "johndoe",
        "age": 30,
        "weight": "75.50",
        "diet_plan_id": 1,
        "sugar_modifier": "1.00",
        "salt_modifier": "1.00",
        "fat_modifier": "1.00",
        "diet_plan_name": "Standard",
        "diet_plan_description": "Balanced diet for everyday nutrition"
    }
}
```

---

### productRoutes.js
Handles product lookup by barcode.

**Base Path:** `/api/product`

**Routes:**
| Method | Endpoint | Handler | Access | Description |
|--------|----------|---------|--------|-------------|
| GET | `/:barcode` | `getProduct` | Public/Auth | Get product by barcode |

**Features:**
- Accepts optional authentication for personalized scoring
- Guest mode returns generic scores
- Authenticated mode returns personalized scores based on diet plan

**Sample Test Payloads:**

Get Product (Guest Mode):
```
bash
GET /api/product/5000159484695
```

Get Product (Authenticated):
```
bash
GET /api/product/5000159484695
Authorization: Bearer <your_jwt_token>
```

**Response (Authenticated):**
```
json
{
    "success": true,
    "mode": "personalized",
    "product": {
        "barcode": "5000159484695",
        "name": "Original Barbecue Potato Chips",
        "brand": "Walkers",
        "category": "Chips",
        "sugar": 3.4,
        "salt": 1.3,
        "saturated_fat": 4.2,
        "fiber": 1.5,
        "calories": 536,
        "score": 3,
        "color": "yellow",
        "warnings": ["High salt"]
    },
    "alternatives": [
        {
            "name": "Baked Potato Chips",
            "score": 4,
            "barcode": "5000159484696"
        }
    ]
}
```

---

### userRoutes.js
Handles admin-level user management.

**Base Path:** `/api/users`

**Routes:**
| Method | Endpoint | Handler | Access | Description |
|--------|----------|---------|--------|-------------|
| GET | `/` | `getAllUsers` | Admin Only | Get all users |
| PUT | `/:id` | `updateUser` | Admin Only | Update user |
| DELETE | `/:id` | `deleteUser` | Admin Only | Delete user |

**Sample Test Payloads:**

Get All Users:
```
bash
GET /api/users
Authorization: Bearer <admin_jwt_token>
```

Update User:
```
bash
PUT /api/users/1
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
    "email": "newemail@example.com",
    "is_admin": false
}
```

Delete User:
```
bash
DELETE /api/users/1
Authorization: Bearer <admin_jwt_token>
```

**Response (Get All Users):**
```
json
{
    "success": true,
    "users": [
        {
            "user_id": 1,
            "email": "john@example.com",
            "is_admin": false,
            "created_at": "2024-01-15T10:00:00.000Z",
            "age": 30,
            "weight": "75.50",
            "health_goal": "Weight loss",
            "diet_plan_id": 1,
            "diet_plan_name": "Low Sugar",
            "diet_plan_description": "Diet plan for reducing sugar intake"
        }
    ]
}
```

**Response (Update User):**
```
json
{
    "success": true,
    "message": "User updated successfully"
}
```

**Response (Delete User):**
```
json
{
    "success": true,
    "message": "User deleted successfully"
}
```

---

## Route Mounting (server.js)

Routes are mounted on the Express app in `server.js`:

```
javascript
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/product', productRoutes);
app.use('/api/users', userRoutes);
```

## Middleware Usage

| Route File | Middleware Used | Purpose |
|------------|-----------------|---------|
| authRoutes.js | None (Public) | Authentication is handled in controller |
| profileRoutes.js | `authMiddleware` | Protected - requires login |
| productRoutes.js | `optionalAuth` | Both guest and authenticated |
| userRoutes.js | `authMiddleware` | Admin check in controller |

## Complete API Endpoint List

| Method | Full Path | Auth Required | Description |
|--------|-----------|---------------|--------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/profile` | Yes | Get profile |
| POST | `/api/profile` | Yes | Save profile |
| GET | `/api/product/:barcode` | No | Get product info |
| GET | `/api/users` | Yes (Admin) | Get all users |
| PUT | `/api/users/:id` | Yes (Admin) | Update user |
| DELETE | `/api/users/:id` | Yes (Admin) | Delete user |
