# Controllers

This folder contains all the request handlers for the FitMax API. Each controller handles specific business logic and interacts with the database through services or directly with the pool.

## Files Overview

### authController.js
Handles user authentication operations.

**Functions:**
- `register(req, res)` - Registers a new user
- `login(req, res)` - Authenticates user and returns JWT token

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Sample Test Payloads:**

Register:
```
json
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
json
{
    "email": "john@example.com",
    "password": "password123"
}
```

---

### profileController.js
Manages user profile information and diet plan modifiers.

**Functions:**
- `saveProfile(req, res)` - Creates or updates user profile with diet-specific modifiers
- `getProfile(req, res)` - Retrieves user profile with diet plan details

**Endpoints:**
- `POST /api/profile`
- `GET /api/profile`

**Sample Test Payloads:**

Save Profile:
```
json
{
    "username": "johndoe",
    "age": 31,
    "weight": 74.5,
    "diet_plan_id": 2
}
```

**Response Example:**
```
json
{
    "success": true,
    "profile": {
        "id": 1,
        "user_id": 1,
        "username": "johndoe",
        "age": 31,
        "weight": 74.5,
        "diet_plan_id": 2,
        "sugar_modifier": 1.5,
        "salt_modifier": 1,
        "fat_modifier": 1,
        "diet_plan_name": "Low Sugar",
        "diet_plan_description": "Diet plan for reducing sugar intake"
    }
}
```

---

### productController.js
Handles product lookup, scoring, and alternatives.

**Functions:**
- `getProduct(req, res)` - Fetches product by barcode, calculates health score, provides alternatives

**Endpoints:**
- `GET /api/product/:barcode`

**Features:**
- Checks database cache first
- Falls back to OpenFoodFacts API if not cached
- Applies personalization for authenticated users
- Returns health score (1-5), color indicator, warnings
- Provides healthier alternative products

**Sample Test Payloads:**

Guest Request:
```
bash
GET /api/product/5000159484695
```

Authenticated Request:
```
bash
GET /api/product/5000159484695
Authorization: Bearer <your_jwt_token>
```

**Response Example:**
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

### userController.js
Admin-only user management operations.

**Functions:**
- `getAllUsers(req, res)` - Retrieves all users (admin only)
- `updateUser(req, res)` - Updates user email or admin status (admin only)
- `deleteUser(req, res)` - Deletes a user and their profile (admin only)

**Endpoints:**
- `GET /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

**Sample Test Payloads:**

Get All Users:
```bash
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

---

### historyController.js
Handles scan history tracking and gamification updates.

**Functions:**
- `saveScan(req, res)` - Saves a product scan and updates gamification
- `getHistory(req, res)` - Retrieves user's scan history

**Endpoints:**
- `POST /api/history` (or similar - check routes)
- `GET /api/history` (or similar - check routes)

**Sample Test Payloads:**

Save Scan:
```
json
{
    "barcode": "5000159484695",
    "score": 4
}
```

**Response:**
```
json
{
    "success": true
}
```

Get History:
```
bash
GET /api/history
Authorization: Bearer <your_jwt_token>
```

**Response Example:**
```
json
{
    "success": true,
    "scans": [
        {
            "id": 1,
            "user_id": 1,
            "barcode": "5000159484695",
            "score": 4,
            "scanned_at": "2024-01-15T10:30:00.000Z"
        }
    ]
}
```

---

### gamificationController.js
Retrieves gamification data for users.

**Functions:**
- `getGamification(req, res)` - Gets user's gamification stats

**Endpoints:**
- `GET /api/gamification` (or similar - check routes)

**Sample Test Payloads:**

Get Gamification:
```
bash
GET /api/gamification
Authorization: Bearer <your_jwt_token>
```

**Response Example:**
```
json
{
    "success": true,
    "gamification": {
        "id": 1,
        "user_id": 1,
        "total_points": 150,
        "current_streak": 5,
        "longest_streak": 10,
        "healthy_percentage": 75.5,
        "last_scan_date": "2024-01-15"
    }
}
```

---

### analyticsController.js
Provides analytics data about user scanning habits.

**Functions:**
- `getAnalytics(req, res)` - Gets comprehensive analytics for a user

**Endpoints:**
- `GET /api/analytics` (or similar - check routes)

**Sample Test Payloads:**

Get Analytics:
```
bash
GET /api/analytics
Authorization: Bearer <your_jwt_token>
```

**Response Example:**
```
json
{
    "success": true,
    "total_scans": 20,
    "healthy_count": 15,
    "healthy_percentage": 75,
    "gamification": {
        "total_points": 150,
        "current_streak": 5,
        "longest_streak": 10
    }
}
```

---

## Middleware Dependencies

Most controllers require authentication. The following middleware is used:
- `authMiddleware` - Full authentication required
- `optionalAuth` - Authentication optional (guest mode supported)

See ../middleware/README.md for more details.
