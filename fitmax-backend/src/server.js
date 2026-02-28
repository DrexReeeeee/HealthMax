const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- new admin/user routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// Routes
console.log('[DEBUG] Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('[DEBUG] Auth routes mounted at /api/auth');

app.use('/api/profile', profileRoutes);
console.log('[DEBUG] Profile routes mounted at /api/profile');

app.use('/api/product', productRoutes);
console.log('[DEBUG] Product routes mounted at /api/product');

app.use('/api/users', userRoutes); // <-- mount user/admin routes
console.log('[DEBUG] User routes mounted at /api/users');

// 404 handler
app.use((req, res) => {
  console.log(`[DEBUG] 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FITMAX server running on port ${PORT}`);
});
