// models/Referral.js - Simple Referral System
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    // ============================================================
    // USER REFERENCE
    // ============================================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One referral record per user
    },

    // ============================================================
    // REFERRAL CODE & URL
    // ============================================================
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    // ============================================================
    // UPLINE (Who referred this user)
    // ============================================================
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ============================================================
    // REFERRAL STATS
    // ============================================================
    referralsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    activeReferrals: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============================================================
    // EARNINGS
    // ============================================================
    totalCommission: {
      type: Number,
      default: 0,
      min: 0
    },
    referralEarnings: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============================================================
    // COMMISSION RATES (Can be customized per user by admin)
    // ============================================================
    level1Rate: {
      type: Number,
      default: 7, // 7% for direct referrals
      min: 0,
      max: 100
    },
    level2Rate: {
      type: Number,
      default: 3, // 3% for second level
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================================
// INDEXES
// ============================================================
referralSchema.index({ userId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referredBy: 1 });

// ============================================================
// VIRTUALS
// ============================================================

/**
 * Generate referral URL with hardcoded domain
 */
referralSchema.virtual('referralUrl').get(function () {
  const domain = process.env.FRONTEND_URL || 'https://goldnest.com';
  return `${domain}/register?ref=${this.referralCode}`;
});

// ============================================================
// METHODS
// ============================================================

/**
 * Add commission earnings
 */
referralSchema.methods.addCommission = async function (amount) {
  this.totalCommission += amount;
  this.referralEarnings += amount;
  await this.save();
  return this;
};

/**
 * Update referral counts
 */
referralSchema.methods.updateCounts = async function (referralsCount, activeReferrals) {
  this.referralsCount = referralsCount;
  this.activeReferrals = activeReferrals;
  await this.save();
  return this;
};

/**
 * Get formatted data for frontend
 */
referralSchema.methods.getFormatted = function () {
  return {
    userId: this.userId,
    referralCode: this.referralCode,
    referralUrl: this.referralUrl, // Uses virtual
    referredBy: this.referredBy,
    referralsCount: this.referralsCount,
    activeReferrals: this.activeReferrals,
    totalCommission: this.totalCommission,
    referralEarnings: this.referralEarnings,
    level1Rate: this.level1Rate,
    level2Rate: this.level2Rate,
    createdAt: this.createdAt
  };
};

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Get or create referral record for user
 */
referralSchema.statics.getOrCreate = async function (userId, referralCode, referredBy = null) {
  let referral = await this.findOne({ userId });
  
  if (!referral) {
    referral = await this.create({
      userId,
      referralCode,
      referredBy,
      referralsCount: 0,
      activeReferrals: 0,
      totalCommission: 0,
      referralEarnings: 0
    });
  }
  
  return referral;
};

/**
 * Get user's referrals (people they referred)
 */
referralSchema.statics.getUserReferrals = async function (userId) {
  return await this.find({ referredBy: userId })
    .populate('userId', 'username email status totalDeposits createdAt')
    .sort({ createdAt: -1 });
};

/**
 * Update referral counts for a user
 */
referralSchema.statics.updateUserCounts = async function (userId) {
  const User = mongoose.model('User');
  
  // Count total referrals
  const totalReferrals = await User.countDocuments({ referredBy: userId });
  
  // Count active referrals (approved status + has deposits)
  const activeReferrals = await User.countDocuments({
    referredBy: userId,
    status: 'approved',
    totalDeposits: { $gt: 0 }
  });
  
  // Update the referral record
  const referral = await this.findOne({ userId });
  if (referral) {
    referral.referralsCount = totalReferrals;
    referral.activeReferrals = activeReferrals;
    await referral.save();
  }
  
  return referral;
};

/**
 * Get admin statistics
 */
referralSchema.statics.getAdminStats = async function () {
  const totalReferrals = await this.countDocuments();
  
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCommission: { $sum: '$totalCommission' },
        totalEarnings: { $sum: '$referralEarnings' },
        avgCommission: { $avg: '$totalCommission' },
        totalActiveReferrals: { $sum: '$activeReferrals' }
      }
    }
  ]);
  
  return {
    totalReferrals,
    totalCommission: stats[0]?.totalCommission || 0,
    totalEarnings: stats[0]?.totalEarnings || 0,
    avgCommission: stats[0]?.avgCommission || 0,
    totalActiveReferrals: stats[0]?.totalActiveReferrals || 0
  };
};

// ============================================================
// EXPORT MODEL
// ============================================================
module.exports = mongoose.model('Referral', referralSchema);