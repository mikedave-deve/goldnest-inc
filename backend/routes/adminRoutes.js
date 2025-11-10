const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// ============================================================
// MIDDLEWARE - Require authentication and admin role
// ============================================================

router.use(authenticate, isAdmin);

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin)
 * @query   { page, limit, status, role, search }
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/search
 * @desc    Search users for dropdowns/autocomplete
 * @access  Private (Admin)
 * @query   { q }
 */
router.get('/users/search', adminController.searchUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get single user details with transactions
 * @access  Private (Admin)
 */
router.get('/users/:userId', adminController.getUserDetails);

/**
 * @route   POST /api/admin/users/:userId/approve
 * @desc    Approve a pending user registration (status: pending -> approved)
 * @access  Private (Admin)
 */
router.post('/users/:userId/approve', adminController.approveUser);

/**
 * @route   POST /api/admin/users/:userId/reject
 * @desc    Reject a user registration (status: pending -> rejected)
 * @access  Private (Admin)
 */
router.post('/users/:userId/reject', adminController.rejectUser);

/**
 * @route   POST /api/admin/users/:userId/suspend
 * @desc    Suspend a user account (status: approved -> suspended)
 * @access  Private (Admin)
 */
router.post('/users/:userId/suspend', adminController.suspendUser);

/**
 * @route   PUT /api/admin/users/:userId/balances
 * @desc    Manually update user balances (all cryptocurrencies and earnings)
 * @access  Private (Admin)
 * @body    { accountBalance, earnedTotal, totalDeposits, activeDeposit, totalWithdraw, btcBalance, usdtBalance, ethBalance, trxBalance }
 */
router.put('/users/:userId/balances', adminController.updateUserBalances);

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Reset user password and send recovery email
 * @access  Private (Admin)
 * @response { success, message, temporaryPassword, user }
 */
router.post('/users/:userId/reset-password', adminController.resetUserPassword);

// ============================================================
// DEPOSIT MANAGEMENT
// ============================================================

/**
 * @route   GET /api/admin/deposits
 * @desc    Get all deposits with pagination and filtering
 * @access  Private (Admin)
 * @query   { page, limit, status, currency }
 */
router.get('/deposits', adminController.getAllDeposits);

// ============================================================
// WITHDRAWAL MANAGEMENT
// ============================================================

/**
 * @route   GET /api/admin/withdrawals
 * @desc    Get all withdrawals with pagination and filtering
 * @access  Private (Admin)
 * @query   { page, limit, status, currency }
 */
router.get('/withdrawals', adminController.getAllWithdrawals);

// ============================================================
// TRANSACTION MANAGEMENT
// ============================================================

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filtering
 * @access  Private (Admin)
 * @query   { type?, status?, userId?, page?, limit? }
 */
router.get('/transactions', adminController.getAllTransactions);

/**
 * @route   POST /api/admin/transactions
 * @desc    Create a new transaction (admin only)
 * @access  Private (Admin)
 * @body    { userId, type, amount, currency, description }
 */
router.post('/transactions', adminController.createTransaction);

// ============================================================
// REFERRAL MANAGEMENT (Placeholder - will implement later)
// ============================================================

/**
 * @route   GET /api/admin/referrals
 * @desc    Get all referral data with pagination
 * @access  Private (Admin)
 * @query   { page, limit }
 * @response { success, referrals, statistics, pagination }
 */
router.get('/referrals', adminController.getAllReferrals);

/**
 * @route   PUT /api/admin/referrals/:userId/commission
 * @desc    Update referral commission percentage for a user
 * @access  Private (Admin)
 * @body    { commissionPercentage }
 * @response { success, message }
 */
router.put('/referrals/:userId/commission', adminController.updateReferralCommission);

// ⭐⭐⭐ ADDED - SETTINGS MANAGEMENT ROUTES ⭐⭐⭐
// ============================================================
// SETTINGS MANAGEMENT
// ============================================================

/**
 * @route   GET /api/admin/settings
 * @desc    Get platform settings
 * @access  Private (Admin)
 * @response { success, settings }
 */
router.get('/settings', adminController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update platform settings
 * @access  Private (Admin)
 * @body    { siteName?, siteEmail?, minDeposit?, minWithdrawal?, depositFee?, withdrawalFee?, referralCommission?, maintenanceMode?, allowRegistration?, requireEmailVerification?, autoApproveDeposits?, autoApproveWithdrawals? }
 * @response { success, message, settings }
 */
router.put('/settings', adminController.updateSettings);

// ⭐⭐⭐ END OF ADDED SETTINGS ROUTES ⭐⭐⭐

// ============================================================
// STATISTICS & ANALYTICS
// ============================================================

/**
 * @route   GET /api/admin/statistics
 * @desc    Get overall platform statistics (users, deposits, withdrawals)
 * @access  Private (Admin)
 * @response { success, statistics }
 */
router.get('/statistics', adminController.getDashboardStats);

/**
 * @route   GET /api/admin/activities
 * @desc    Get recent platform activities (deposits, withdrawals, registrations)
 * @access  Private (Admin)
 * @query   { limit }
 * @response { success, activities }
 */
router.get('/activities', adminController.getRecentActivities);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;