// routes/referralRoutes.js - COMPLETE AND WORKING
const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// ============================================================
// USER REFERRAL ROUTES (Protected - User only)
// ============================================================

/**
 * @route   GET /api/referrals/me
 * @desc    Get current user's referral data
 * @access  Private (User)
 */
router.get('/me', authenticate, referralController.getUserReferral);

/**
 * @route   GET /api/referrals/me/stats
 * @desc    Get current user's referral statistics
 * @access  Private (User)
 */
router.get('/me/stats', authenticate, referralController.getReferralStats);

/**
 * @route   GET /api/referrals/me/referred-users
 * @desc    Get list of users referred by current user
 * @access  Private (User)
 */
router.get('/me/referred-users', authenticate, referralController.getReferredUsers);

// ============================================================
// ADMIN REFERRAL ROUTES (Protected - Admin only)
// ============================================================

/**
 * @route   GET /api/referrals/admin/all
 * @desc    Get all referrals with pagination
 * @access  Private (Admin)
 */
router.get('/admin/all', authenticate, isAdmin, referralController.getAllReferrals);

/**
 * @route   GET /api/referrals/admin/stats
 * @desc    Get overall referral statistics for admin
 * @access  Private (Admin)
 */
router.get('/admin/stats', authenticate, isAdmin, referralController.getAdminStats);

/**
 * @route   GET /api/referrals/admin/top-earners
 * @desc    Get top referral earners
 * @access  Private (Admin)
 */
router.get('/admin/top-earners', authenticate, isAdmin, referralController.getTopEarners);

/**
 * @route   GET /api/referrals/admin/search
 * @desc    Search referrals by username or code
 * @access  Private (Admin)
 */
router.get('/admin/search', authenticate, isAdmin, referralController.searchReferrals);

/**
 * @route   GET /api/referrals/admin/:referralId
 * @desc    Get specific referral by ID
 * @access  Private (Admin)
 */
router.get('/admin/:referralId', authenticate, isAdmin, referralController.getReferralById);

/**
 * @route   PUT /api/referrals/admin/:referralId
 * @desc    Update referral data
 * @access  Private (Admin)
 */
router.put('/admin/:referralId', authenticate, isAdmin, referralController.updateReferral);

/**
 * @route   POST /api/referrals/admin/:referralId/commission
 * @desc    Add commission to referral
 * @access  Private (Admin)
 */
router.post('/admin/:referralId/commission', authenticate, isAdmin, referralController.addCommission);

/**
 * @route   DELETE /api/referrals/admin/:referralId
 * @desc    Delete referral record
 * @access  Private (Admin)
 */
router.delete('/admin/:referralId', authenticate, isAdmin, referralController.deleteReferral);

module.exports = router;