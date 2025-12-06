const jwt = require('jsonwebtoken');
const Player = require('../models/Player');
const Trainer = require('../models/Trainer');

/**
 * Middleware to verify JWT token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a token.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

      // Find user based on role
      let user;
      if (decoded.role === 'player') {
        user = await Player.findById(decoded.id).select('-Password');
      } else if (decoded.role === 'trainer') {
        user = await Trainer.findById(decoded.id).select('-Password');
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Role not recognized.'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found with this token.'
        });
      }

      // Attach user to request
      req.user = {
        id: user._id.toString(),
        email: user.Email || user.email,
        firstName: user.fName,
        lastName: user.Lname || user.lname,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };

