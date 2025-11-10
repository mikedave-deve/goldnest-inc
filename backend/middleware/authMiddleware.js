const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

/**
 * Verify JWT token and attach user to request
 * Updates last login timestamp
 * Checks if user status is approved
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header (Bearer token)
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // CRITICAL: Check user status (using 'status' field, not 'isActive')
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact support.'
      });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin confirmation.'
      });
    }

    // Only approved users can proceed
    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account access denied. Please contact support.'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    // Update last login (don't await, just fire and forget)
    user.lastLogin = new Date();
    user.save({ validateBeforeSave: false }).catch(err => 
      console.error('Error updating last login:', err)
    );

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// ============================================================
// AUTHORIZATION MIDDLEWARE - Check user roles
// ============================================================

/**
 * Check if user has required roles
 * @param {...String} roles - Required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// ============================================================
// ADMIN ONLY MIDDLEWARE
// ============================================================

/**
 * Verify user is admin
 */
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

// ============================================================
// USER APPROVED MIDDLEWARE
// ============================================================

/**
 * Verify user account is approved by admin
 * (This checks status === 'approved')
 */
const isApproved = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check status field instead of isApproved
    if (req.user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please contact support.'
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Approval check failed'
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isApproved
};