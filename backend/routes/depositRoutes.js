const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/deposits/create
 * @desc    Create a new deposit request
 * @access  Private (Approved users only)
 * @body    { amount, currency, plan, profitPercentage }
 */
router.post('/create', authenticate, depositController.createDeposit);

/**
 * @route   GET /api/deposits/user-deposits
 * @desc    Get all deposits for current user
 * @access  Private
 */
router.get('/user-deposits', authenticate, depositController.getUserDeposits);

/**
 * @route   GET /api/deposits/active
 * @desc    Get active/approved deposits for current user (with total active balance)
 * @access  Private
 * @response { success, deposits[], totalActive }
 */
router.get('/active', authenticate, depositController.getActiveDeposits);

/**
 * @route   GET /api/deposits/:depositId
 * @desc    Get single deposit by ID
 * @access  Private
 */
router.get('/:depositId', authenticate, depositController.getDepositById);

/**
 * @route   PUT /api/deposits/approve/:depositId
 * @desc    Approve a deposit (Admin only)
 * @access  Private (Admin)
 * @body    { notes }
 */
router.put('/approve/:depositId', authenticate, isAdmin, depositController.approveDeposit);

/**
 * @route   PUT /api/deposits/reject/:depositId
 * @desc    Reject a deposit (Admin only)
 * @access  Private (Admin)
 * @body    { reason, notes }
 */
router.put('/reject/:depositId', authenticate, isAdmin, depositController.rejectDeposit);

module.exports = router;