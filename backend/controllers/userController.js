// controllers/userController.js - FIXED: Properly syncs with Referral model
const User = require('../models/User');
const Referral = require('../models/Referral');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Ensure Referral record exists and is synced
    let referral = await Referral.findOne({ userId: req.user._id });
    
    if (!referral && user.referralCode) {
      const referredCount = await User.countDocuments({ referredBy: req.user._id });
      const activeCount = await User.countDocuments({
        referredBy: req.user._id,
        status: 'approved',
        totalDeposits: { $gt: 0 }
      });
      
      referral = await Referral.create({
        userId: req.user._id,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: activeCount,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
      console.log('✅ Created Referral record for user on profile fetch');
    } else if (referral && referral.referralCode !== user.referralCode) {
      // Sync referral code if there's a mismatch
      referral.referralCode = user.referralCode;
      await referral.save();
      console.log('✅ Synced referral code on profile fetch');
    }

    res.status(200).json({
      success: true,
      user,
      profile: user // Send both for compatibility
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

/**
 * @desc    Get user balances
 * @route   GET /api/user/balances
 * @access  Private
 */
exports.getBalances = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'accountBalance earnedTotal totalDeposits activeDeposit totalWithdraw btcBalance usdtBalance ethBalance trxBalance'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      balances: {
        accountBalance: user.accountBalance || 0,
        earnedTotal: user.earnedTotal || 0,
        totalDeposits: user.totalDeposits || 0,
        activeDeposit: user.activeDeposit || 0,
        totalWithdraw: user.totalWithdraw || 0,
        btcBalance: user.btcBalance || 0,
        usdtBalance: user.usdtBalance || 0,
        ethBalance: user.ethBalance || 0,
        trxBalance: user.trxBalance || 0
      }
    });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balances',
      error: error.message
    });
  }
};

/**
 * @desc    Get user dashboard data
 * @route   GET /api/user/dashboard
 * @access  Private
 * 
 * FIXED: Properly syncs with Referral model and returns consistent referral code
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('📊 Fetching dashboard for user:', userId);

    // CRITICAL: Use lean() to bypass Mongoose caching and get fresh data
    const user = await User.findById(userId)
      .select('-password')
      .lean(); // Forces fresh database read

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User found:', user.username);
    console.log('💰 Current balances:', {
      accountBalance: user.accountBalance,
      totalDeposits: user.totalDeposits,
      btcBalance: user.btcBalance
    });

    // FIXED: Ensure Referral record exists and sync with User model
    let referral = await Referral.findOne({ userId }).lean();
    
    if (!referral && user.referralCode) {
      // Create Referral record if it doesn't exist
      const referredCount = await User.countDocuments({ referredBy: userId });
      const activeCount = await User.countDocuments({
        referredBy: userId,
        status: 'approved',
        totalDeposits: { $gt: 0 }
      });
      
      referral = await Referral.create({
        userId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: activeCount,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
      
      referral = referral.toObject(); // Convert to plain object
      console.log('✅ Created Referral record on dashboard fetch');
    } else if (referral && referral.referralCode !== user.referralCode) {
      // Sync referral code if there's a mismatch
      await Referral.updateOne(
        { userId },
        { 
          $set: { 
            referralCode: user.referralCode,
            totalCommission: user.totalCommission || 0,
            referralEarnings: user.referralEarnings || 0
          } 
        }
      );
      referral.referralCode = user.referralCode;
      referral.totalCommission = user.totalCommission || 0;
      referral.referralEarnings = user.referralEarnings || 0;
      console.log('✅ Synced referral data on dashboard fetch');
    }

    // Build dashboard data with fresh values
    const dashboardData = {
      // User info
      username: user.username || 'User',
      email: user.email || '',
      fullName: user.fullName || '',
      status: user.status || 'pending',
      
      // Balances - directly from database
      accountBalance: user.accountBalance || 0,
      earnedTotal: user.earnedTotal || 0,
      totalDeposits: user.totalDeposits || 0,
      activeDeposit: user.activeDeposit || 0,
      totalWithdraw: user.totalWithdraw || 0,
      
      // Cryptocurrency balances - directly from database
      btcBalance: user.btcBalance || 0,
      usdtBalance: user.usdtBalance || 0,
      ethBalance: user.ethBalance || 0,
      trxBalance: user.trxBalance || 0,
      
      // Dates
      registrationDate: user.createdAt || new Date(),
      lastLogin: user.lastLogin || user.createdAt || new Date(),
      
      // Counts
      activeDepositsCount: 0,
      pendingDepositsCount: 0,
      pendingWithdrawalsCount: 0,
      
      // FIXED: Referral data - use User model as source of truth
      referralsCount: referral?.referralsCount || 0,
      activeReferralsCount: referral?.activeReferrals || 0,
      totalCommission: user.totalCommission || 0, // Use User model value
      referralCode: user.referralCode || '', // Use User model value
      
      // Timestamp for cache busting
      fetchedAt: new Date().toISOString()
    };

    // Get deposit counts
    try {
      dashboardData.activeDepositsCount = await Deposit.countDocuments({
        userId,
        status: 'approved'
      });
      
      dashboardData.pendingDepositsCount = await Deposit.countDocuments({
        userId,
        status: 'pending'
      });
      
      console.log('✅ Deposit counts fetched');
    } catch (depError) {
      console.warn('⚠️  Error fetching deposit counts:', depError.message);
    }

    // Get withdrawal counts
    try {
      dashboardData.pendingWithdrawalsCount = await Withdrawal.countDocuments({
        userId,
        status: 'pending'
      });
      
      console.log('✅ Withdrawal counts fetched');
    } catch (withError) {
      console.warn('⚠️  Error fetching withdrawal counts:', withError.message);
    }

    // Get recent transactions
    try {
      const recentTransactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type amount currency status createdAt description')
        .lean();
      
      dashboardData.recentTransactions = recentTransactions || [];
      console.log('✅ Recent transactions fetched');
    } catch (txError) {
      console.warn('⚠️  Error fetching transactions:', txError.message);
      dashboardData.recentTransactions = [];
    }

    console.log('✅ Dashboard data prepared successfully');
    console.log('📝 Referral code in response:', dashboardData.referralCode);

    // Set cache-control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack 
      })
    });
  }
};

/**
 * @desc    Get user referral data
 * @route   GET /api/user/referrals
 * @access  Private
 * 
 * FIXED: Returns consistent referral data synced between User and Referral models
 */
exports.getReferralData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('username email referralCode totalCommission referralEarnings referredBy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Get or create referral record and ensure sync
    let referral = await Referral.findOne({ userId });
    
    if (!referral && user.referralCode) {
      // Create new referral record
      const referredCount = await User.countDocuments({ referredBy: userId });
      const activeCount = await User.countDocuments({
        referredBy: userId,
        status: 'approved',
        totalDeposits: { $gt: 0 }
      });
      
      referral = await Referral.create({
        userId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: activeCount,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
      console.log('✅ Created Referral record');
    } else if (referral) {
      // Sync if there's a mismatch
      let needsUpdate = false;
      
      if (referral.referralCode !== user.referralCode) {
        referral.referralCode = user.referralCode;
        needsUpdate = true;
      }
      
      if (referral.totalCommission !== user.totalCommission) {
        referral.totalCommission = user.totalCommission || 0;
        needsUpdate = true;
      }
      
      if (referral.referralEarnings !== user.referralEarnings) {
        referral.referralEarnings = user.referralEarnings || 0;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await referral.save();
        console.log('✅ Synced Referral record');
      }
    }

    // Get referred users
    const referredUsers = await User.find({ referredBy: userId })
      .select('username email status totalDeposits createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Prepare referral data - use User model as source of truth
    const referralData = {
      referralCode: user.referralCode || '',
      referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`,
      username: user.username,
      referralsCount: referral?.referralsCount || 0,
      activeReferrals: referral?.activeReferrals || 0,
      totalCommission: user.totalCommission || 0, // Use User model value
      referralEarnings: user.referralEarnings || 0, // Use User model value
      referredBy: user.referredBy || null,
      referrals: referredUsers
    };

    console.log('✅ Referral data fetched:', {
      code: referralData.referralCode,
      count: referralData.referralsCount
    });

    res.status(200).json({
      success: true,
      referralData
    });
  } catch (error) {
    console.error('Get referral data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral data',
      error: error.message
    });
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/user/statistics
 * @access  Private
 */
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get transaction statistics
    const transactions = await Transaction.find({ userId });

    const stats = {
      totalTransactions: transactions.length,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalProfit: 0,
      totalCommission: 0,
      byType: {},
      byCurrency: {},
      byStatus: {}
    };

    transactions.forEach(tx => {
      // By type
      if (tx.type === 'deposit') stats.totalDeposited += tx.amount;
      if (tx.type === 'withdrawal') stats.totalWithdrawn += tx.amount;
      if (tx.type === 'profit') stats.totalProfit += tx.amount;
      if (tx.type === 'referral_commission') stats.totalCommission += tx.amount;

      // Group by type
      stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;

      // Group by currency
      stats.byCurrency[tx.currency] = (stats.byCurrency[tx.currency] || 0) + 1;

      // Group by status
      stats.byStatus[tx.status] = (stats.byStatus[tx.status] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
};

module.exports = exports;