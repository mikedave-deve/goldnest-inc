// controllers/referralController.js - FIXED: Syncs User & Referral models properly
const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');

// ============================================================
// USER REFERRAL CONTROLLERS
// ============================================================

/**
 * @desc    Get current user's referral data
 * @route   GET /api/referrals/me
 * @access  Private (User)
 */
exports.getUserReferral = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with referral data
    const user = await User.findById(userId)
      .select('username email referralCode referredBy referralEarnings totalCommission')
      .populate('referredBy', 'username email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Ensure Referral record exists and is synced with User model
    let referral = await Referral.findOne({ userId });
    
    if (!referral && user.referralCode) {
      // Create Referral record if it doesn't exist
      referral = await Referral.create({
        userId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: 0,
        activeReferrals: 0,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
      console.log('✅ Created Referral record for user:', user.username);
    } else if (referral && referral.referralCode !== user.referralCode) {
      // Sync referral code if there's a mismatch
      referral.referralCode = user.referralCode;
      await referral.save();
      console.log('✅ Synced referral code for user:', user.username);
    }

    // Get referred users count
    const referredUsersCount = await User.countDocuments({
      referredBy: userId,
      status: 'approved'
    });

    // Get active referrals count (users with deposits)
    const activeReferralsCount = await User.countDocuments({
      referredBy: userId,
      status: 'approved',
      totalDeposits: { $gt: 0 }
    });

    // FIXED: Update counts in Referral model
    if (referral) {
      referral.referralsCount = referredUsersCount;
      referral.activeReferrals = activeReferralsCount;
      await referral.save();
    }

    // Generate referral URL
    const referralUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`;

    res.status(200).json({
      success: true,
      referral: {
        referralCode: user.referralCode,
        referralUrl,
        username: user.username,
        email: user.email,
        referredBy: user.referredBy,
        referralEarnings: user.referralEarnings || 0,
        totalCommission: user.totalCommission || 0,
        referredUsersCount,
        activeReferralsCount
      }
    });
  } catch (error) {
    console.error('Get user referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral data',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user's referral statistics
 * @route   GET /api/referrals/me/stats
 * @access  Private (User)
 */
exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all referred users
    const referredUsers = await User.find({
      referredBy: userId
    }).select('status totalDeposits createdAt');

    // Calculate statistics
    const totalReferrals = referredUsers.length;
    const activeReferrals = referredUsers.filter(u => u.status === 'approved' && u.totalDeposits > 0).length;
    const pendingReferrals = referredUsers.filter(u => u.status === 'pending').length;

    // Get referral commission transactions
    const commissionTransactions = await Transaction.find({
      userId,
      type: 'referral_commission'
    }).sort({ createdAt: -1 });

    const totalEarnings = commissionTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Get this month's earnings
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthEarnings = commissionTransactions
      .filter(tx => new Date(tx.createdAt) >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalReferrals,
        activeReferrals,
        pendingReferrals,
        totalEarnings,
        thisMonthEarnings,
        recentTransactions: commissionTransactions.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get list of users referred by current user
 * @route   GET /api/referrals/me/referred-users
 * @access  Private (User)
 */
exports.getReferredUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get referred users with pagination
    const referredUsers = await User.find({
      referredBy: userId
    })
      .select('username email status totalDeposits activeDeposit createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalCount = await User.countDocuments({
      referredBy: userId
    });

    res.status(200).json({
      success: true,
      referredUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + referredUsers.length < totalCount
      }
    });
  } catch (error) {
    console.error('Get referred users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referred users',
      error: error.message
    });
  }
};

// ============================================================
// ADMIN REFERRAL CONTROLLERS - FIXED TO SYNC USER & REFERRAL MODELS
// ============================================================

/**
 * @desc    Get all referrals with pagination (Admin)
 * @route   GET /api/referrals/admin/all
 * @access  Private (Admin)
 */
exports.getAllReferrals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    console.log('📊 Fetching all referrals - Page:', page, 'Limit:', limit);

    // Get ALL users (not just those with referralCode)
    const users = await User.find({})
      .select('username email referralCode referralEarnings totalCommission status createdAt')
      .sort({ totalCommission: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('✅ Found', users.length, 'users');

    // Get referred users count for each and ensure Referral records exist
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const referredCount = await User.countDocuments({
          referredBy: user._id
        });
        
        // FIXED: Ensure Referral record exists and is synced
        let referral = await Referral.findOne({ userId: user._id });
        
        if (!referral && user.referralCode) {
          referral = await Referral.create({
            userId: user._id,
            referralCode: user.referralCode,
            referredBy: user.referredBy,
            referralsCount: referredCount,
            activeReferrals: 0,
            totalCommission: user.totalCommission || 0,
            referralEarnings: user.referralEarnings || 0
          });
        } else if (referral) {
          // Update referral record with latest counts
          referral.referralsCount = referredCount;
          if (referral.referralCode !== user.referralCode) {
            referral.referralCode = user.referralCode;
          }
          await referral.save();
        }
        
        return {
          ...user.toObject(),
          referredUsersCount: referredCount
        };
      })
    );

    // Get total count
    const totalCount = await User.countDocuments({});

    console.log('📤 Sending', usersWithCounts.length, 'referrals to frontend');

    res.status(200).json({
      success: true,
      referrals: usersWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + users.length < totalCount
      }
    });
  } catch (error) {
    console.error('❌ Get all referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all referrals',
      error: error.message
    });
  }
};

/**
 * @desc    Get overall referral statistics (Admin)
 * @route   GET /api/referrals/admin/stats
 * @access  Private (Admin)
 */
exports.getAdminStats = async (req, res) => {
  try {
    console.log('📊 Calculating admin referral stats...');

    // Total users with referrals (users who have referralCode)
    const totalUsersWithReferrals = await User.countDocuments({
      referralCode: { $exists: true, $ne: null, $ne: '' }
    });

    // Total referred users (users who were referred by someone)
    const totalReferredUsers = await User.countDocuments({
      referredBy: { $exists: true, $ne: null }
    });

    // Active referrals (referred users with deposits)
    const activeReferrals = await User.countDocuments({
      referredBy: { $exists: true, $ne: null },
      totalDeposits: { $gt: 0 }
    });

    // Total commission paid
    const commissionTransactions = await Transaction.find({
      type: 'referral_commission'
    });
    const totalCommissionPaid = commissionTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // This month's commission
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthCommission = commissionTransactions
      .filter(tx => new Date(tx.createdAt) >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const stats = {
      totalUsersWithReferrals,
      totalReferredUsers,
      activeReferrals,
      totalCommissionPaid,
      thisMonthCommission,
      averageCommissionPerUser: totalUsersWithReferrals > 0 
        ? totalCommissionPaid / totalUsersWithReferrals 
        : 0
    };

    console.log('✅ Admin stats calculated:', stats);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get top referral earners (Admin)
 * @route   GET /api/referrals/admin/top-earners
 * @access  Private (Admin)
 */
exports.getTopEarners = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    console.log('🏆 Fetching top', limit, 'earners...');

    const topEarners = await User.find({
      totalCommission: { $gt: 0 }
    })
      .select('username email totalCommission referralEarnings referralCode')
      .sort({ totalCommission: -1 })
      .limit(limit);

    // Get referred users count for each
    const earnersWithCounts = await Promise.all(
      topEarners.map(async (user) => {
        const referredCount = await User.countDocuments({
          referredBy: user._id
        });
        return {
          ...user.toObject(),
          referredUsersCount: referredCount
        };
      })
    );

    console.log('✅ Top earners fetched');

    res.status(200).json({
      success: true,
      topEarners: earnersWithCounts
    });
  } catch (error) {
    console.error('❌ Get top earners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top earners',
      error: error.message
    });
  }
};

/**
 * @desc    Search referrals by username or code (Admin)
 * @route   GET /api/referrals/admin/search
 * @access  Private (Admin)
 */
exports.searchReferrals = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    console.log('🔍 Searching referrals for:', query);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { referralCode: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username email referralCode totalCommission referralEarnings status')
      .limit(20);

    // Get referred users count for each
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const referredCount = await User.countDocuments({
          referredBy: user._id
        });
        return {
          ...user.toObject(),
          referredUsersCount: referredCount
        };
      })
    );

    console.log('✅ Found', usersWithCounts.length, 'results');

    res.status(200).json({
      success: true,
      results: usersWithCounts
    });
  } catch (error) {
    console.error('❌ Search referrals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search referrals',
      error: error.message
    });
  }
};

/**
 * @desc    Get specific referral by ID (Admin)
 * @route   GET /api/referrals/admin/:referralId
 * @access  Private (Admin)
 */
exports.getReferralById = async (req, res) => {
  try {
    const { referralId } = req.params;

    console.log('🔍 Fetching referral details for:', referralId);

    const user = await User.findById(referralId)
      .select('username email referralCode referredBy referralEarnings totalCommission status createdAt')
      .populate('referredBy', 'username email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Ensure Referral record exists and is synced
    let referral = await Referral.findOne({ userId: referralId });
    
    if (!referral && user.referralCode) {
      const referredCount = await User.countDocuments({ referredBy: referralId });
      referral = await Referral.create({
        userId: referralId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: 0,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
    }

    // Get referred users
    const referredUsers = await User.find({
      referredBy: referralId
    }).select('username email status totalDeposits createdAt');

    // Get commission transactions
    const commissionTransactions = await Transaction.find({
      userId: referralId,
      type: 'referral_commission'
    }).sort({ createdAt: -1 }).limit(10);

    console.log('✅ Fetched details for:', user.username);

    res.status(200).json({
      success: true,
      referral: {
        ...user.toObject(),
        referredUsers,
        recentCommissions: commissionTransactions
      }
    });
  } catch (error) {
    console.error('❌ Get referral by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral details',
      error: error.message
    });
  }
};

/**
 * @desc    Update referral data (Admin)
 * @route   PUT /api/referrals/admin/:referralId
 * @access  Private (Admin)
 * 
 * FIXED: Now updates BOTH User and Referral models and returns fresh data
 */
exports.updateReferral = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { referralEarnings, totalCommission, referralCode } = req.body;

    console.log('📝 Updating referral:', referralId);
    console.log('📦 Update data:', { referralEarnings, totalCommission, referralCode });

    const user = await User.findById(referralId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Update User model fields
    if (referralEarnings !== undefined) {
      user.referralEarnings = Number(referralEarnings);
    }
    if (totalCommission !== undefined) {
      user.totalCommission = Number(totalCommission);
    }
    if (referralCode !== undefined && referralCode !== user.referralCode) {
      // Check if new referral code is unique
      const existingUser = await User.findOne({ 
        referralCode, 
        _id: { $ne: referralId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Referral code already exists'
        });
      }
      
      user.referralCode = referralCode.toUpperCase();
    }

    await user.save();

    // FIXED: Update or create Referral model record
    let referral = await Referral.findOne({ userId: referralId });
    
    if (!referral) {
      // Create new referral record
      const referredCount = await User.countDocuments({ referredBy: referralId });
      const activeCount = await User.countDocuments({
        referredBy: referralId,
        status: 'approved',
        totalDeposits: { $gt: 0 }
      });
      
      referral = await Referral.create({
        userId: referralId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: activeCount,
        totalCommission: user.totalCommission || 0,
        referralEarnings: user.referralEarnings || 0
      });
      console.log('✅ Created new Referral record');
    } else {
      // Update existing referral record
      if (referralEarnings !== undefined) {
        referral.referralEarnings = Number(referralEarnings);
      }
      if (totalCommission !== undefined) {
        referral.totalCommission = Number(totalCommission);
      }
      if (referralCode !== undefined) {
        referral.referralCode = referralCode.toUpperCase();
      }
      
      await referral.save();
      console.log('✅ Updated existing Referral record');
    }

    console.log('✅ Updated referral for:', user.username);

    // FIXED: Return fresh user data with all updated fields
    const updatedUser = await User.findById(referralId)
      .select('_id username email referralCode referralEarnings totalCommission status');

    res.status(200).json({
      success: true,
      message: 'Referral data updated successfully',
      referral: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        referralCode: updatedUser.referralCode,
        referralEarnings: updatedUser.referralEarnings,
        totalCommission: updatedUser.totalCommission,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('❌ Update referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update referral data',
      error: error.message
    });
  }
};

/**
 * @desc    Add commission to referral (Admin)
 * @route   POST /api/referrals/admin/:referralId/commission
 * @access  Private (Admin)
 * 
 * FIXED: Properly handles Transaction model and updates both User and Referral
 */
exports.addCommission = async (req, res) => {
  try {
    const { referralId } = req.params;
    const { amount, description } = req.body;

    console.log('💰 Adding commission:', amount, 'to user:', referralId);

    // FIXED: Validate amount properly
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid commission amount is required (must be a positive number)'
      });
    }

    const commissionAmount = Number(amount);

    const user = await User.findById(referralId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // FIXED: Update user's commission and balances
    user.referralEarnings = (user.referralEarnings || 0) + commissionAmount;
    user.totalCommission = (user.totalCommission || 0) + commissionAmount;
    user.accountBalance = (user.accountBalance || 0) + commissionAmount;

    await user.save();

    // FIXED: Update Referral model if it exists
    let referral = await Referral.findOne({ userId: referralId });
    
    if (referral) {
      referral.totalCommission = (referral.totalCommission || 0) + commissionAmount;
      referral.referralEarnings = (referral.referralEarnings || 0) + commissionAmount;
      await referral.save();
      console.log('✅ Updated Referral record');
    } else {
      // Create Referral record if it doesn't exist
      const referredCount = await User.countDocuments({ referredBy: referralId });
      const activeCount = await User.countDocuments({
        referredBy: referralId,
        status: 'approved',
        totalDeposits: { $gt: 0 }
      });
      
      referral = await Referral.create({
        userId: referralId,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralsCount: referredCount,
        activeReferrals: activeCount,
        totalCommission: commissionAmount,
        referralEarnings: commissionAmount
      });
      console.log('✅ Created Referral record');
    }

    // FIXED: Create transaction record with proper error handling
    let transaction = null;
    try {
      transaction = await Transaction.create({
        userId: referralId,
        username: user.username, // ✅ FIXED: Include username
        type: 'commission', // ✅ FIXED: Use 'commission' from enum (not 'referral_commission')
        amount: commissionAmount,
        currency: 'usd', // ✅ FIXED: Lowercase to match schema enum
        status: 'completed',
        description: description || 'Admin added referral commission'
      });
      console.log('✅ Transaction created:', transaction._id);
    } catch (txError) {
      console.error('⚠️ Transaction creation error:', txError.message);
      console.error('⚠️ Full error:', txError);
      // Don't fail the entire operation if transaction fails
      transaction = {
        error: 'Transaction record creation failed',
        message: txError.message
      };
    }

    console.log('✅ Commission added successfully');

    res.status(200).json({
      success: true,
      message: 'Commission added successfully',
      user: {
        _id: user._id,
        username: user.username,
        referralEarnings: user.referralEarnings,
        totalCommission: user.totalCommission,
        accountBalance: user.accountBalance
      },
      transaction: transaction
    });
  } catch (error) {
    console.error('❌ Add commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add commission',
      error: error.message
    });
  }
};

/**
 * @desc    Delete referral record (Admin) - USE WITH CAUTION
 * @route   DELETE /api/referrals/admin/:referralId
 * @access  Private (Admin)
 */
exports.deleteReferral = async (req, res) => {
  try {
    const { referralId } = req.params;

    console.log('🗑️  Resetting referral data for:', referralId);

    const user = await User.findById(referralId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has any referred users
    const referredUsersCount = await User.countDocuments({
      referredBy: referralId
    });

    if (referredUsersCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete referral - user has active referrals',
        referredUsersCount
      });
    }

    // Reset referral data in User model
    user.referralEarnings = 0;
    user.totalCommission = 0;
    user.referredBy = null;

    await user.save();

    // FIXED: Also delete/reset Referral model record
    const referral = await Referral.findOne({ userId: referralId });
    if (referral) {
      referral.totalCommission = 0;
      referral.referralEarnings = 0;
      referral.referredBy = null;
      referral.referralsCount = 0;
      referral.activeReferrals = 0;
      await referral.save();
      console.log('✅ Referral model record reset');
    }

    console.log('✅ Referral data reset for:', user.username);

    res.status(200).json({
      success: true,
      message: 'Referral data reset successfully',
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ Delete referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete referral',
      error: error.message
    });
  }
};

module.exports = exports;