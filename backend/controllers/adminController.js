const User = require('../models/User');
const Referral = require('../models/Referral');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const crypto = require('crypto');

// ============================================================
// HELPER FUNCTION - Generate Random Password
// ============================================================

const generateRandomPassword = (length = 12) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const adminController = {
  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  // GET ALL USERS
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, role, search } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};

      if (status) {
        filter.status = status;
      }
      
      if (role) {
        filter.role = role;
      }

      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      res.status(200).json({
        success: true,
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  },

  // SEARCH USERS (for dropdowns/autocomplete)
  searchUsers: async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { fullName: { $regex: q, $options: 'i' } }
        ]
      })
        .select('_id username email fullName status')
        .limit(parseInt(limit))
        .sort({ username: 1 });

      res.status(200).json({
        success: true,
        users: users.map(u => ({
          id: u._id,
          _id: u._id,
          username: u.username,
          email: u.email,
          fullName: u.fullName,
          status: u.status,
          label: `${u.username} (${u.email})`
        }))
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error.message
      });
    }
  },

  // GET SINGLE USER DETAILS
  getUserDetails: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
      const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });
      const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        user,
        deposits,
        withdrawals,
        recentTransactions: transactions
      });
    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details',
        error: error.message
      });
    }
  },

  // APPROVE USER REGISTRATION
  approveUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { status: 'approved' },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ User approved:', user.username);

      try {
        let referralRecord = await Referral.findOne({ userId });
        
        if (!referralRecord && user.referralCode) {
          referralRecord = await Referral.create({
            userId,
            referralCode: user.referralCode,
            referredBy: user.referredBy,
            referralsCount: 0,
            activeReferrals: 0,
            totalCommission: 0,
            referralEarnings: 0
          });
          console.log('✅ Referral record created on approval');
        }

        if (user.referredBy) {
          await Referral.updateUserCounts(user.referredBy);
          console.log('✅ Updated referrer counts');
        }
      } catch (refError) {
        console.error('⚠️  Error handling referral on approval:', refError.message);
      }

      res.status(200).json({
        success: true,
        message: 'User approved successfully',
        user: user.getPublicProfile ? user.getPublicProfile() : user
      });
    } catch (error) {
      console.error('Approve user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve user',
        error: error.message
      });
    }
  },

  // REJECT USER REGISTRATION
  rejectUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { status: 'rejected' },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ User rejected:', user.username);

      res.status(200).json({
        success: true,
        message: 'User rejected',
        user: user.getPublicProfile ? user.getPublicProfile() : user
      });
    } catch (error) {
      console.error('Reject user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject user',
        error: error.message
      });
    }
  },

  // SUSPEND USER
  suspendUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        { status: 'suspended' },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('✅ User suspended:', user.username);

      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        user: user.getPublicProfile ? user.getPublicProfile() : user
      });
    } catch (error) {
      console.error('Suspend user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to suspend user',
        error: error.message
      });
    }
  },

  // UPDATE USER BALANCES
  updateUserBalances: async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        accountBalance,
        earnedTotal,
        totalDeposits,
        activeDeposit,
        totalWithdraw,
        btcBalance,
        usdtBalance,
        ethBalance,
        trxBalance
      } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const changes = {};
      if (accountBalance !== undefined && accountBalance !== user.accountBalance) {
        changes.accountBalance = { old: user.accountBalance, new: accountBalance };
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(accountBalance !== undefined && { accountBalance }),
          ...(earnedTotal !== undefined && { earnedTotal }),
          ...(totalDeposits !== undefined && { totalDeposits }),
          ...(activeDeposit !== undefined && { activeDeposit }),
          ...(totalWithdraw !== undefined && { totalWithdraw }),
          ...(btcBalance !== undefined && { btcBalance }),
          ...(usdtBalance !== undefined && { usdtBalance }),
          ...(ethBalance !== undefined && { ethBalance }),
          ...(trxBalance !== undefined && { trxBalance })
        },
        { new: true, runValidators: true }
      );

      console.log('✅ User balances updated for:', user.username);

      res.status(200).json({
        success: true,
        message: 'User balances updated successfully',
        user: updatedUser.getPublicProfile ? updatedUser.getPublicProfile() : updatedUser,
        changes
      });
    } catch (error) {
      console.error('Update user balances error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user balances',
        error: error.message
      });
    }
  },

  // ADMIN RESET USER PASSWORD
  resetUserPassword: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const newPassword = generateRandomPassword(12);

      user.password = newPassword;
      user.lastPasswordChange = Date.now();
      await user.save();

      console.log('✅ Password reset for user:', user.username);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully!',
        temporaryPassword: newPassword,
        user: user.getPublicProfile ? user.getPublicProfile() : user
      });
    } catch (error) {
      console.error('Reset user password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset user password',
        error: error.message
      });
    }
  },

  // ============================================================
  // DEPOSIT MANAGEMENT
  // ============================================================

  getAllDeposits: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, currency } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;
      if (currency) filter.currency = currency;

      const deposits = await Deposit.find(filter)
        .populate('userId', 'username email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Deposit.countDocuments(filter);

      res.status(200).json({
        success: true,
        deposits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all deposits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deposits',
        error: error.message
      });
    }
  },

  // ============================================================
  // WITHDRAWAL MANAGEMENT
  // ============================================================

  getAllWithdrawals: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, currency } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (status) filter.status = status;
      if (currency) filter.currency = currency;

      const withdrawals = await Withdrawal.find(filter)
        .populate('userId', 'username email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Withdrawal.countDocuments(filter);

      res.status(200).json({
        success: true,
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all withdrawals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawals',
        error: error.message
      });
    }
  },

  // ============================================================
  // TRANSACTION MANAGEMENT
  // ============================================================

  getAllTransactions: async (req, res) => {
    try {
      const { page = 1, limit = 20, type, status, userId } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (userId) filter.userId = userId;

      const transactions = await Transaction.find(filter)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(filter);

      const formattedTransactions = transactions.map(tx => ({
        _id: tx._id,
        user: {
          _id: tx.userId?._id,
          username: tx.userId?.username || tx.username || 'Unknown',
          email: tx.userId?.email || 'N/A'
        },
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency || 'usd',
        description: tx.description,
        status: tx.status || 'completed',
        date: tx.date || tx.createdAt,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt
      }));

      res.status(200).json({
        success: true,
        transactions: formattedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const { userId, type, amount, currency, description } = req.body;

      console.log('📝 Creating transaction:', { userId, type, amount, currency });

      if (!userId || !type || !amount) {
        return res.status(400).json({
          success: false,
          message: 'userId, type, and amount are required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const transactionAmount = parseFloat(amount);

      const transaction = await Transaction.create({
        userId,
        username: user.username,
        type,
        amount: transactionAmount,
        currency: currency || 'usd',
        description: description || `Admin created ${type} transaction`,
        status: 'completed',
        date: new Date()
      });

      console.log('✅ Transaction created:', transaction._id);

      // Update user balances
      try {
        let balanceUpdate = {};
        
        switch(type) {
          case 'deposit':
            balanceUpdate.accountBalance = (user.accountBalance || 0) + transactionAmount;
            balanceUpdate.totalDeposits = (user.totalDeposits || 0) + transactionAmount;
            
            if (currency === 'bitcoin') {
              balanceUpdate.btcBalance = (user.btcBalance || 0) + transactionAmount;
            } else if (currency === 'usdt') {
              balanceUpdate.usdtBalance = (user.usdtBalance || 0) + transactionAmount;
            } else if (currency === 'ethereum') {
              balanceUpdate.ethBalance = (user.ethBalance || 0) + transactionAmount;
            } else if (currency === 'tron') {
              balanceUpdate.trxBalance = (user.trxBalance || 0) + transactionAmount;
            }
            break;

          case 'withdrawal':
            balanceUpdate.accountBalance = Math.max(0, (user.accountBalance || 0) - transactionAmount);
            balanceUpdate.totalWithdraw = (user.totalWithdraw || 0) + transactionAmount;
            
            if (currency === 'bitcoin') {
              balanceUpdate.btcBalance = Math.max(0, (user.btcBalance || 0) - transactionAmount);
            } else if (currency === 'usdt') {
              balanceUpdate.usdtBalance = Math.max(0, (user.usdtBalance || 0) - transactionAmount);
            } else if (currency === 'ethereum') {
              balanceUpdate.ethBalance = Math.max(0, (user.ethBalance || 0) - transactionAmount);
            } else if (currency === 'tron') {
              balanceUpdate.trxBalance = Math.max(0, (user.trxBalance || 0) - transactionAmount);
            }
            break;

          case 'earning':
          case 'profit':
            balanceUpdate.accountBalance = (user.accountBalance || 0) + transactionAmount;
            balanceUpdate.earnedTotal = (user.earnedTotal || 0) + transactionAmount;
            break;

          case 'commission':
          case 'bonus':
          case 'refund':
            balanceUpdate.accountBalance = (user.accountBalance || 0) + transactionAmount;
            break;
        }

        if (Object.keys(balanceUpdate).length > 0) {
          await User.findByIdAndUpdate(userId, balanceUpdate);
          console.log('✅ User balances updated:', balanceUpdate);
        }
        
      } catch (updateError) {
        console.error('⚠️  Failed to update user balance:', updateError.message);
      }

      const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('userId', 'username email');

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        transaction: {
          _id: populatedTransaction._id,
          user: {
            _id: populatedTransaction.userId._id,
            username: populatedTransaction.userId.username,
            email: populatedTransaction.userId.email
          },
          type: populatedTransaction.type,
          amount: populatedTransaction.amount,
          currency: populatedTransaction.currency,
          description: populatedTransaction.description,
          status: populatedTransaction.status,
          date: populatedTransaction.date || populatedTransaction.createdAt
        }
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message
      });
    }
  },

  // ============================================================
  // REFERRAL MANAGEMENT
  // ============================================================

  getAllReferrals: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const referrals = await Referral.find()
        .populate('userId', 'username email accountBalance status createdAt')
        .populate('referredBy', 'username')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ totalCommission: -1 });

      const total = await Referral.countDocuments();

      const stats = await Referral.getAdminStats();

      res.status(200).json({
        success: true,
        referrals: referrals.map(r => r.getFormatted ? r.getFormatted() : r),
        statistics: stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all referrals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch referral data',
        error: error.message
      });
    }
  },

  updateReferralCommission: async (req, res) => {
    try {
      const { userId } = req.params;
      const { level1Rate, level2Rate } = req.body;

      let referral = await Referral.findOne({ userId });
      if (!referral) {
        return res.status(404).json({
          success: false,
          message: 'Referral record not found'
        });
      }

      if (level1Rate !== undefined) {
        if (level1Rate < 0 || level1Rate > 100) {
          return res.status(400).json({
            success: false,
            message: 'Level 1 rate must be between 0 and 100'
          });
        }
        referral.level1Rate = level1Rate;
      }

      if (level2Rate !== undefined) {
        if (level2Rate < 0 || level2Rate > 100) {
          return res.status(400).json({
            success: false,
            message: 'Level 2 rate must be between 0 and 100'
          });
        }
        referral.level2Rate = level2Rate;
      }

      await referral.save();

      res.status(200).json({
        success: true,
        message: 'Commission rates updated',
        referral: referral.getFormatted ? referral.getFormatted() : referral
      });
    } catch (error) {
      console.error('Update referral commission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update commission',
        error: error.message
      });
    }
  },


   // ============================================================
  // SETTINGS MANAGEMENT
  // ============================================================

  /**
   * @desc    Get platform settings
   * @route   GET /api/admin/settings
   * @access  Private (Admin)
   */
  getSettings: async (req, res) => {
    try {
      console.log('📋 Fetching platform settings...');
      
      let settings = await Settings.findOne();
      
      // If no settings exist, create default settings
      if (!settings) {
        console.log('⚠️ No settings found, creating defaults...');
        settings = await Settings.create({
          siteName: "GoldNest Inc",
          siteEmail: "support@goldnest-inc.biz",
          minDeposit: 50,
          minWithdrawal: 1,
          depositFee: 0,
          withdrawalFee: 0,
          referralCommission: 7,
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true,
          autoApproveDeposits: false,
          autoApproveWithdrawals: false,
        });
        console.log('✅ Default settings created');
      }

      console.log('✅ Settings fetched successfully');
      res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('❌ Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error.message
      });
    }
  },

  /**
   * @desc    Update platform settings
   * @route   PUT /api/admin/settings
   * @access  Private (Admin)
   */
  updateSettings: async (req, res) => {
    try {
      console.log('💾 Updating platform settings...');
      console.log('📦 Received data:', req.body);

      let settings = await Settings.findOne();

      if (!settings) {
        // Create new settings if none exist
        console.log('⚠️ No settings found, creating new...');
        settings = await Settings.create(req.body);
        console.log('✅ Settings created successfully');
      } else {
        // Update existing settings
        Object.assign(settings, req.body);
        await settings.save();
        console.log('✅ Settings updated successfully');
      }

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        settings
      });
    } catch (error) {
      console.error('❌ Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error.message
      });
    }
  },

  // ============================================================
  // PLATFORM STATISTICS
  // ============================================================

  getDashboardStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const approvedUsers = await User.countDocuments({ status: 'approved' });
      const pendingUsers = await User.countDocuments({ status: 'pending' });
      const rejectedUsers = await User.countDocuments({ status: 'rejected' });
      const suspendedUsers = await User.countDocuments({ status: 'suspended' });

      const totalDeposits = await Deposit.countDocuments();
      const approvedDeposits = await Deposit.countDocuments({ status: 'approved' });
      const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });

      const depositStats = await Deposit.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);

      const totalWithdrawals = await Withdrawal.countDocuments();
      const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
      const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });

      const withdrawalStats = await Withdrawal.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);

      const totalTransactions = await Transaction.countDocuments();

      res.status(200).json({
        success: true,
        statistics: {
          users: {
            total: totalUsers,
            approved: approvedUsers,
            pending: pendingUsers,
            rejected: rejectedUsers,
            suspended: suspendedUsers
          },
          deposits: {
            total: totalDeposits,
            approved: approvedDeposits,
            pending: pendingDeposits,
            totalAmount: depositStats.length > 0 ? depositStats[0].totalAmount : 0,
            avgAmount: depositStats.length > 0 ? depositStats[0].avgAmount : 0
          },
          withdrawals: {
            total: totalWithdrawals,
            approved: approvedWithdrawals,
            pending: pendingWithdrawals,
            totalAmount: withdrawalStats.length > 0 ? withdrawalStats[0].totalAmount : 0,
            avgAmount: withdrawalStats.length > 0 ? withdrawalStats[0].avgAmount : 0
          },
          transactions: {
            total: totalTransactions
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  getRecentActivities: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const recentDeposits = await Deposit.find()
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      const recentWithdrawals = await Withdrawal.find()
        .populate('userId', 'username')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      const recentUsers = await User.find()
        .select('username email status createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        activities: {
          recentDeposits: recentDeposits.map(d => ({
            id: d._id,
            username: d.userId?.username,
            amount: d.amount,
            currency: d.currency,
            status: d.status,
            date: d.createdAt,
            type: 'deposit'
          })),
          recentWithdrawals: recentWithdrawals.map(w => ({
            id: w._id,
            username: w.userId?.username,
            amount: w.amount,
            currency: w.currency,
            status: w.status,
            date: w.createdAt,
            type: 'withdrawal'
          })),
          recentRegistrations: recentUsers.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            status: u.status,
            date: u.createdAt,
            type: 'registration'
          }))
        }
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activities',
        error: error.message
      });
    }
  }
};

module.exports = adminController;