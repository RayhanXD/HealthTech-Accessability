const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const playerRoutes = require('./routes/playerRoutes');
const trainerRoutes = require('./routes/trainerRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(limiter); // Rate limiting
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/convergent_db';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/players', playerRoutes);
app.use('/api/trainers', trainerRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Convergent API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      players: '/api/players',
      trainers: '/api/trainers'
    },
    documentation: {
      players: {
        'GET /api/players': 'Get all players with optional filtering',
        'GET /api/players/:id': 'Get single player by ID',
        'POST /api/players': 'Create new player',
        'PUT /api/players/:id': 'Update player',
        'DELETE /api/players/:id': 'Delete player',
        'PUT /api/players/:id/insights': 'Update player insights',
        'POST /api/players/:id/trends': 'Add trend to player',
        'POST /api/players/:id/comparisons': 'Add comparison to player'
      },
      trainers: {
        'GET /api/trainers': 'Get all trainers with optional filtering',
        'GET /api/trainers/:id': 'Get single trainer by ID',
        'POST /api/trainers': 'Create new trainer',
        'PUT /api/trainers/:id': 'Update trainer',
        'DELETE /api/trainers/:id': 'Delete trainer',
        'GET /api/trainers/:id/players': 'Get trainer\'s players',
        'POST /api/trainers/:id/players': 'Add player to trainer',
        'DELETE /api/trainers/:id/players/:playerId': 'Remove player from trainer'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/players',
      'GET /api/players/:id',
      'POST /api/players',
      'PUT /api/players/:id',
      'DELETE /api/players/:id',
      'PUT /api/players/:id/insights',
      'POST /api/players/:id/trends',
      'POST /api/players/:id/comparisons',
      'GET /api/trainers',
      'GET /api/trainers/:id',
      'POST /api/trainers',
      'PUT /api/trainers/:id',
      'DELETE /api/trainers/:id',
      'GET /api/trainers/:id/players',
      'POST /api/trainers/:id/players',
      'DELETE /api/trainers/:id/players/:playerId'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API docs: http://localhost:${PORT}/`);
});

module.exports = app;
