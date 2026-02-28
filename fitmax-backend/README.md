# FitMax Backend

A Node.js/Express REST API for a health-focused food product scanning application. FitMax allows users to scan food products, get health scores based on nutritional content, and track their scanning history with gamification features.

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)

## Project Overview

FitMax Backend provides:
- User authentication (register/login)
- Product barcode scanning and health scoring
- Personalized health scores based on user diet plans
- Gamification (points, streaks, healthy percentage)
- User profile management
- Admin user management

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (using mysql2/promise)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **HTTP Client:** axios (for OpenFoodFacts API)

## Project Structure

```
fitmax-backend/
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── README.md               # This file
└── src/
    ├── server.js           # Main application entry point
    ├── config/
    │   └── db.js           # MySQL database configuration
    ├── controllers/
    │   ├── authController.js       # Authentication logic
    │   ├── profileController.js     # User profile management
    │   ├── productController.js     # Product lookup & scoring
    │   ├── userController.js        # Admin user management
    │   ├── historyController.js     # Scan history tracking
    │   ├── gamificationController.js # Gamification data
    │   └── analyticsController.js   # Analytics data
    ├── middleware/
    │   ├── authMiddleware.js        # JWT authentication
    │   └── optionalAuth.js          # Optional authentication
    ├── routes/
    │   ├── authRoutes.js            # /api/auth routes
    │   ├── profileRoutes.js         # /api/profile routes
    │   ├── productRoutes.js         # /api/product routes
    │   └── userRoutes.js            # /api/users routes
    └── services/
        ├── scoringService.js         # Health score calculation
        ├── personalizationService.js# User modifier retrieval
        ├── alternativeService.js     # Product alternatives
        └── gamificationService.js    # Gamification logic
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
```
bash
npm install
```

3. Create a `.env` file in the root directory (see Environment Variables below)

4. Start the server:
```
bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on port 5000 by default (or the port specified in `.env`).

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |

### Profile (`/api/profile`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/profile` | Get user profile | Authenticated |
| POST | `/api/profile` | Save/update user profile | Authenticated |

### Products (`/api/product`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/product/:barcode` | Get product by barcode | Public/Auth |

### Users (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

## Database Schema

### Required Tables

```
sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    weight DECIMAL(5,2),
    diet_plan_id INT,
    sugar_modifier DECIMAL(3,2) DEFAULT 1,
    salt_modifier DECIMAL(3,2) DEFAULT 1,
    fat_modifier DECIMAL(3,2) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Diet plans table
CREATE TABLE diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Products table (cache)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    brand VARCHAR(255),
    category TEXT,
    sugar DECIMAL(5,2),
    salt DECIMAL(5,2),
    saturated_fat DECIMAL(5,2),
    fiber DECIMAL(5,2),
    calories DECIMAL(7,2),
    score INT
);

-- Scans history table
CREATE TABLE scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    barcode VARCHAR(255) NOT NULL,
    score INT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Gamification table
CREATE TABLE gamification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    healthy_percentage DECIMAL(5,2) DEFAULT 0,
    last_scan_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fitmax

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# External API
OPENFOODFACTS_API=https://world.openfoodfacts.org/api/v0
```

## Sample Test Payloads

### Register User
```
bash
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

### Login
```
bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

### Get Profile (with Auth)
```
bash
GET /api/profile
Authorization: Bearer <your_jwt_token>
```

### Save Profile
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

### Get Product (Guest Mode)
```
bash
GET /api/product/5000159484695
```

### Get Product (Authenticated - Personalized)
```
bash
GET /api/product/5000159484695
Authorization: Bearer <your_jwt_token>
```

### Get All Users (Admin Only)
```
bash
GET /api/users
Authorization: Bearer <admin_jwt_token>
```

### Update User (Admin Only)
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

### Delete User (Admin Only)
```
bash
DELETE /api/users/1
Authorization: Bearer <admin_jwt_token>
```

## License

ISC
