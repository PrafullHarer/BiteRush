/**
 * Express Application Setup with MongoDB connection
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/database');
const UserModel = require('./models/userModel');
const { seedDishes } = require('./models/dishModel');
const AuthController = require('./controllers/authController');
const DishController = require('./controllers/dishController');
const { authenticateToken } = require('./middleware/authMiddleware');

const app = express();
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure MongoDB database is connected on requests
app.use(async (req, res, next) => {
  await connectDB();
  UserModel.seedDemoUser();
  seedDishes();
  next();
});

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static assets from public/ folder
app.use(express.static(PUBLIC_DIR));

// --------------------------------------------------------------------------
// API Routes
// --------------------------------------------------------------------------
app.post('/api/register', AuthController.register);
app.post('/api/login', AuthController.login);
app.get('/api/me', authenticateToken, AuthController.getProfile);

// Dish & Order API Routes
app.get('/api/dishes', DishController.getDishes);
app.post('/api/orders', authenticateToken, DishController.createOrder);
app.get('/api/orders', authenticateToken, DishController.getOrders);

// --------------------------------------------------------------------------
// Page Routes
// --------------------------------------------------------------------------
app.get('/login', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

// Root / Fallback route -> index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

module.exports = app;
