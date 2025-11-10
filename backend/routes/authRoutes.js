const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// ============================================================
// PUBLIC ROUTES - No authentication required
// ============================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username, email, password, confirmPassword, referralCode, fullName, phone }
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Step 1: Request password reset - sends confirmation email with link
 * @access  Public
 * @body    { email }
 * @response { success, message }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/confirm-password-reset
 * @desc    Step 2: Confirm password reset - generates new password
 * @access  Public
 * @body    { token }
 * @response { success, message }
 */
router.post('/confirm-password-reset', authController.confirmPasswordReset);

// ============================================================
// PRIVATE ROUTES - Authentication required
// ============================================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password (requires current password)
 * @access  Private
 * @body    { currentPassword, newPassword, confirmPassword }
 */
router.put('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (frontend clears token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;