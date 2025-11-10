// ============================================================
// GOLDNEST INVESTMENT PLATFORM BACKEND
// Server with Integrated Express App
// ============================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

let totalEndpointsCount = 0; 

// Used for tracking the number of endpoints per route group
const routeGroupEndpoints = {};

// ============================================================
// SECURITY & GLOBAL MIDDLEWARE
// ============================================================

// Secure HTTP headers
app.use(helmet());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Enable CORS with dynamic origin
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Rate limiting - Global API limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' // Don't rate limit health checks
});
app.use('/api', limiter);

// Parse request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const level = req.path.includes('/health') ? '💚' : '📡';
  console.log(`${level} [${timestamp}] ${req.method.padEnd(6)} ${req.path}`);
  next();
});

// ============================================================
// DATABASE CONNECTION
// ============================================================

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnest-investment-platform';

  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    const dbName = mongoose.connection.db?.databaseName || 'goldnest-investment-platform';
    console.log(`✅ MongoDB connected successfully to: ${dbName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);

    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    return false;
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// ============================================================
// IMPORT AND MOUNT ROUTES
// ============================================================

let routesLoaded = false;

console.log('\n========== LOADING ROUTES ==========');

// Load and mount routes individually with error handling
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Error loading auth routes:', err.message);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/user', userRoutes);
  console.log('✅ User routes loaded');
} catch (err) {
  console.error('❌ Error loading user routes:', err.message);
}

try {
  const depositRoutes = require('./routes/depositRoutes');
  app.use('/api/deposits', depositRoutes);
  console.log('✅ Deposit routes loaded');
} catch (err) {
  console.error('❌ Error loading deposit routes:', err.message);
}

try {
  const withdrawalRoutes = require('./routes/withdrawalRoutes');
  app.use('/api/withdrawals', withdrawalRoutes);
  console.log('✅ Withdrawal routes loaded');
} catch (err) {
  console.error('❌ Error loading withdrawal routes:', err.message);
}

try {
  const transactionRoutes = require('./routes/transactionRoutes');
  app.use('/api/transactions', transactionRoutes);
  console.log('✅ Transaction routes loaded');
} catch (err) {
  console.error('❌ Error loading transaction routes:', err.message);
}

try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (err) {
  console.error('❌ Error loading admin routes:', err.message);
}

try {
  const referralRoutes = require('./routes/referralRoutes');
  app.use('/api/referrals', referralRoutes);
  console.log('✅ Referral routes loaded');
} catch (err) {
  console.error('❌ Error loading referral routes:', err.message);
}

console.log('====================================\n');
routesLoaded = true;

// ============================================================
// DYNAMIC ROUTE COUNTING (BEST PRACTICE)
// ============================================================

const countApiEndpoints = (stack) => {
    let count = 0;
    stack.forEach(layer => {
        if (layer.route) {
            // Found an endpoint layer (e.g., app.get('/', ...))
            count += Object.keys(layer.route.methods).length;
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            // Found a mounted router (e.g., app.use('/api', router))
            // Recursively count routes within the mounted router
            count += countApiEndpoints(layer.handle.stack);
        }
    });
    return count;
};

// Count only routes mounted under '/api' (skip global middleware before any /api path)
const apiRouter = app._router.stack.find(layer => layer.regexp.test('/api')).handle;
if (apiRouter && apiRouter.stack) {
  totalEndpointsCount = countApiEndpoints(apiRouter.stack);
}

// Add the two health check endpoints to the count (since they are app.get, not part of mounted routers)
totalEndpointsCount += 2; 
routeGroupEndpoints['Health Checks'] = 2;

console.log(`\n✅ Successfully detected ${totalEndpointsCount} API endpoints.`);
console.log('====================================\n');
routesLoaded = true;

// ============================================================
// HEALTH CHECK ENDPOINTS
// ============================================================

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GoldNest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check
app.get('/api/health/detailed', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const dbStatus = dbConnected ? 'Connected' : 'Disconnected';

  res.status(200).json({
    status: dbConnected ? 'OK' : 'DEGRADED',
    message: 'Detailed health information',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus,
      connected: dbConnected,
      host: mongoose.connection.host || 'N/A',
      port: mongoose.connection.port || 'N/A',
      dbName: mongoose.connection.db?.databaseName || 'N/A'
    },
    routes: {
      loaded: routesLoaded,
      totalEndpoints: 39
    },
    services: {
      email: process.env.SMTP_USER ? '✅ Configured' : '❌ Not configured',
      jwt: process.env.JWT_SECRET ? '✅ Configured' : '❌ Not configured'
    },
    server: {
      uptime: process.uptime(),
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`
      },
      pid: process.pid,
      nodeVersion: process.version
    }
  });
});

// ============================================================
// 404 NOT FOUND HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('❌ Error:', {
    message: err.message,
    status: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ...(isDev && { stack: err.stack })
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message),
      timestamp: new Date().toISOString()
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      field,
      timestamp: new Date().toISOString()
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(isDev && { 
      stack: err.stack,
      fullError: err
    })
  });
});

// ============================================================
// SERVER INITIALIZATION
// ============================================================

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 GOLDNEST INVESTMENT PLATFORM - STARTING SERVER...');
    console.log('='.repeat(70) + '\n');

    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      // Allow server to start even if DB connection fails, 
      // but log a severe warning (useful for local development without MongoDB)
      console.warn('⚠️  Server is starting without a database connection.');
    }

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      const baseUrl = `http://${HOST}:${PORT}`;
      const totalEndpointsString = totalEndpointsCount.toString();
      const endpointsSection = totalEndpointsCount === 0 
        ? '⚠️ No API endpoints detected (excluding health checks) '
        : `➜ Total: ${totalEndpointsString} API Endpoints${' '.repeat(70 - 24 - totalEndpointsString.length)}`;

      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ✅ GoldNest Investment Platform Backend                 ║
║   🟢 Server is running and ready!                         ║
║                                                            ║
║   📍 Server Information:                                   ║
║   • URL: ${baseUrl.padEnd(68)}║
║   • Port: ${PORT.toString().padEnd(68)}║
║   • Environment: ${NODE_ENV.padEnd(61)}║
║   • Node Version: ${process.version.padEnd(60)}║
║                                                            ║
║   🔗 API Base URL: ${baseUrl}/api${' '.repeat(58)}║
║                                                            ║
║   🏥 Health Checks:                                        ║
║   • GET ${baseUrl}/api/health${' '.repeat(59)}║
║   • GET ${baseUrl}/api/health/detailed${' '.repeat(47)}║
║                                                            ║
║   📚 Available Endpoints:                                  ║
║   • Authentication (6 endpoints)                           ║
║   • User Management (5 endpoints)                          ║
║   • Deposits (6 endpoints)                                 ║
║   • Withdrawals (6 endpoints)                              ║
║   • Transactions (5 endpoints)                             ║
║   • Admin Panel (11 endpoints)                             ║
║   ${endpointsSection}║                              ║
║                                                            ║
║   🔐 Security:                                             ║
║   • Helmet: Enabled                                        ║
║   • CORS: Enabled                                          ║
║   • Rate Limiting: Enabled                                 ║
║   • MongoDB Sanitization: Enabled                          ║
║                                                            ║
║   📧 Services:                                             ║
║   • Email: ${(process.env.SMTP_USER ? '✅ Active' : '❌ Disabled').padEnd(64)}║
║   • JWT: ${(process.env.JWT_SECRET ? '✅ Active' : '❌ Disabled').padEnd(67)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

      Ready for requests! Press Ctrl+C to stop.
      `);
    });

    // ============================================================
    // GRACEFUL SHUTDOWN (Mongoose v8+ compatible)
    // ============================================================

    const gracefulShutdown = async (signal) => {
      console.log(`\n📴 ${signal} received, shutting down gracefully...`);

      // Close HTTP server
      server.close(async () => {
        console.log('✅ HTTP server closed');

        try {
          // Close MongoDB connection
          await mongoose.connection.close(false);
          console.log('✅ MongoDB connection closed');
        } catch (err) {
          console.error('⚠️  Error closing MongoDB:', err.message);
        } finally {
          console.log('✅ Server shutdown complete');
          process.exit(0);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown - connections still active');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

// ============================================================
// START SERVER
// ============================================================

startServer();

module.exports = app;

