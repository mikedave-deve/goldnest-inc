const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile with referral info
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   GET /api/user/balances
 * @desc    Get user balances (all currencies and earnings)
 * @access  Private
 */
router.get('/balances', authenticate, userController.getBalances);

/**
 * @route   GET /api/user/dashboard
 * @desc    Get dashboard data with all stats (for Welcome Page & Navbar)
 * @access  Private
 * @response { 
 *   success, 
 *   dashboard: { 
 *     username, earnedTotal, totalDeposits, activeDeposit, totalWithdraw,
 *     accountBalance, btcBalance, usdtBalance, ethBalance, trxBalance,
 *     registrationDate, referralsCount, activeReferralsCount, totalCommission, activeDepositsCount 
 *   } 
 * }
 */
router.get('/dashboard', authenticate, userController.getDashboard);

/**
 * @route   GET /api/user/referrals
 * @desc    Get referral data and earnings (referral URL, counts, commissions)
 * @access  Private
 * @response {
 *   success,
 *   referralData: {
 *     referralCode, referralUrl, username, referralsCount, activeReferrals,
 *     totalCommission, referredBy, referrals[]
 *   }
 * }
 */
router.get('/referrals', authenticate, userController.getReferralData);

/**
 * @route   GET /api/user/statistics
 * @desc    Get user transaction statistics and analytics
 * @access  Private
 */
router.get('/statistics', authenticate, userController.getStatistics);

module.exports = router;