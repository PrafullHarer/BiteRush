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

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets FIRST for lightning fast page loads
app.use(express.static(PUBLIC_DIR));

// Background initialization
let initPromise = null;
const initDB = async () => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await connectDB();
      await UserModel.seedDemoUser();
      await seedDishes();
    } catch (e) {
      initPromise = null;
      console.error('Initialization error:', e.message);
      throw e;
    }
  })();
  return initPromise;
};

// Start initialization immediately
initDB().catch(() => {});

// Ensure DB is initialized before executing /api routes
app.use('/api', async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    console.error('Database connection error on API request:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed: ' + err.message
    });
  }
});

// Request Logging
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

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
