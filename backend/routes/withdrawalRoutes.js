const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/withdrawals/request
 * @desc    Request a withdrawal (first click)
 * @access  Private (Approved users only)
 * @body    { amount, currency, walletAddress }
 */
router.post('/request', authenticate, withdrawalController.requestWithdrawal);

/**
 * @route   PUT /api/withdrawals/confirm/:withdrawalId
 * @desc    Confirm withdrawal (two-click system - second click)
 * @access  Private
 * @response { success, message, withdrawal }
 */
router.put('/confirm/:withdrawalId', authenticate, withdrawalController.confirmWithdrawal);

/**
 * @route   GET /api/withdrawals/user-withdrawals
 * @desc    Get all withdrawals for current user
 * @access  Private
 */
router.get('/user-withdrawals', authenticate, withdrawalController.getUserWithdrawals);

/**
 * @route   GET /api/withdrawals/all
 * @desc    Get all withdrawals (Admin only)
 * @access  Private (Admin)
 * @query   { status } - optional filter by status
 */
router.get('/all', authenticate, isAdmin, withdrawalController.getAllWithdrawals);

/**
 * @route   GET /api/withdrawals/:withdrawalId
 * @desc    Get single withdrawal by ID
 * @access  Private
 */
router.get('/:withdrawalId', authenticate, withdrawalController.getWithdrawalById);

/**
 * @route   PUT /api/withdrawals/approve/:withdrawalId
 * @desc    Approve a withdrawal (Admin only)
 * @access  Private (Admin)
 * @body    { notes }
 */
router.put('/approve/:withdrawalId', authenticate, isAdmin, withdrawalController.approveWithdrawal);

/**
 * @route   PUT /api/withdrawals/complete/:withdrawalId
 * @desc    Mark withdrawal as completed with transaction hash (Admin only)
 * @access  Private (Admin)
 * @body    { transactionHash }
 */
router.put('/complete/:withdrawalId', authenticate, isAdmin, withdrawalController.completeWithdrawal);

/**
 * @route   PUT /api/withdrawals/reject/:withdrawalId
 * @desc    Reject a withdrawal (Admin only)
 * @access  Private (Admin)
 * @body    { reason, notes }
 */
router.put('/reject/:withdrawalId', authenticate, isAdmin, withdrawalController.rejectWithdrawal);

module.exports = router;