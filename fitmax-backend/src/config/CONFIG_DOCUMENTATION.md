# Config

This folder contains configuration files for the application.

## Files Overview

### db.js
MySQL database connection configuration using `mysql2/promise`.

**Configuration:**
```
javascript
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

**Configuration Options:**
| Option | Description | Required |
|--------|-------------|----------|
| host | Database host (e.g., localhost) | Yes |
| user | Database username | Yes |
| password | Database password | Yes |
| database | Database name | Yes |
| waitForConnections | Wait for available connection | Yes |
| connectionLimit | Maximum connections in pool | Yes (default: 10) |
| queueLimit | Maximum queued requests (0 = unlimited) | Yes |

**Usage:**
```
javascript
const pool = require('../config/db');

// Query examples
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
```

**Environment Variables Required:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fitmax
```

---

## Database Connection Pool

The application uses a connection pool for better performance and resource management:

- **Connection Limit:** 10 concurrent connections
- **Queue Limit:** Unlimited (no requests will be rejected due to queue)
- **Auto-reconnect:** Handled by mysql2 driver

---

## Query Methods

### pool.query(sql, params)
Used for SELECT, INSERT, UPDATE, DELETE statements.

```
javascript
// SELECT
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [1]);

// INSERT
const [result] = await pool.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    ['user@example.com', 'hashedPassword']
);
console.log(result.insertId); // New user's ID

// UPDATE
await pool.query(
    'UPDATE users SET email = ? WHERE id = ?',
    ['new@example.com', 1]
);

// DELETE
await pool.query('DELETE FROM users WHERE id = ?', [1]);
```

---

## Transaction Support

For operations requiring multiple queries with rollback support:

```
javascript
const conn = await pool.getConnection();
try {
    await conn.beginTransaction();
    
    await conn.query('INSERT INTO table1 ...');
    await conn.query('INSERT INTO table2 ...');
    
    await conn.commit();
} catch (err) {
    await conn.rollback();
    throw err;
} finally {
    conn.release();
}
```

---

## Sample Test Scenarios

### Testing Database Connection
```
javascript
const pool = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Database connected:', rows[0].result);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

testConnection();
```

### Testing Queries
```
javascript
// Test with sample data
const [users] = await pool.query(
    'SELECT u.id, u.email, up.username FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id'
);

console.log('Users:', users);
```

---

## Troubleshooting

### Connection Issues
If you encounter connection errors:

1. **Check environment variables:**
   
```
bash
   echo $DB_HOST  # Should print your host
   
```

2. **Verify MySQL is running:**
   
```
bash
   mysqladmin ping
   
```

3. **Test credentials:**
   
```
bash
   mysql -u root -p -h localhost
   
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | MySQL not running | Start MySQL service |
| `ER_ACCESS_DENIED` | Wrong credentials | Check DB_USER and DB_PASSWORD |
| `ER_BAD_DB_ERROR` | Database doesn't exist | Create database |
| `ER_TABLE_EXISTS_ERROR` | Table already exists | Drop table or use IF NOT EXISTS |
