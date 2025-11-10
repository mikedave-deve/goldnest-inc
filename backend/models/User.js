// models/User.js - SIMPLIFIED & CLEAN (Referrals moved to Referral model)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC USER INFO
    // ============================================================
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },

    // ============================================================
    // ACCOUNT STATUS (SIMPLIFIED)
    // ============================================================
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending' // CRITICAL: Default is pending approval
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    // ============================================================
    // FINANCIAL BALANCES
    // ============================================================
    accountBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    earnedTotal: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDeposits: {
      type: Number,
      default: 0,
      min: 0
    },
    activeDeposit: {
      type: Number,
      default: 0,
      min: 0
    },
    totalWithdraw: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============================================================
    // CRYPTOCURRENCY BALANCES
    // ============================================================
    btcBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    usdtBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    ethBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    trxBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    // ============================================================
    // REFERRAL FIELDS (Minimal - main data in Referral model)
    // ============================================================
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    
    // CRITICAL: Commission tracking fields (synced with Referral model)
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
    // WALLET ADDRESSES
    // ============================================================
    walletAddresses: {
      bitcoin: { type: String, default: '' },
      usdt: { type: String, default: '' },
      ethereum: { type: String, default: '' },
      tron: { type: String, default: '' }
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    lastPasswordChange: Date,

    // ============================================================
    // TIMESTAMPS
    // ============================================================
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================================
// INDEXES - REMOVED "index: true" from fields to avoid duplicates
// ============================================================
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ status: 1 });

/**
 * Generate unique referral code
 */
const generateReferralCode = async function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 8-character code
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Check if code already exists
  const User = this.constructor;
  const existingUser = await User.findOne({ referralCode: code });
  
  if (existingUser) {
    // If code exists, generate a new one recursively
    return generateReferralCode.call(this);
  }
  
  return code;
};

// ============================================================
// MIDDLEWARE - Hash password before saving
// ============================================================
userSchema.pre('save', async function (next) {
  // Only hash password if it IS modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error); // properly pass the error to Mongoose
    }
  }

  // Generate referral code if not exists
  if (!this.referralCode) {
    this.referralCode = await generateReferralCode.call(this);
  }

  next();
});


// ============================================================
// METHODS
// ============================================================

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate temporary password for password reset
 */
userSchema.methods.generateTemporaryPassword = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Get public profile (without sensitive data)
 */
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    status: this.status,
    role: this.role,
    accountBalance: this.accountBalance,
    earnedTotal: this.earnedTotal,
    totalDeposits: this.totalDeposits,
    activeDeposit: this.activeDeposit,
    totalWithdraw: this.totalWithdraw,
    btcBalance: this.btcBalance,
    usdtBalance: this.usdtBalance,
    ethBalance: this.ethBalance,
    trxBalance: this.trxBalance,
    walletAddresses: this.walletAddresses,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// ============================================================
// VIRTUALS
// ============================================================

/**
 * Virtual for registration date
 */
userSchema.virtual('registrationDate').get(function () {
  return this.createdAt;
});

/**
 * Virtual to check if user has active investment
 */
userSchema.virtual('hasActiveInvestment').get(function () {
  return this.status === 'approved' && this.totalDeposits > 0;
});

/**
 * Virtual to check if user is approved
 */
userSchema.virtual('isApproved').get(function () {
  return this.status === 'approved';
});

/**
 * Virtual to check if user is active
 */
userSchema.virtual('isActive').get(function () {
  return this.status !== 'suspended' && this.status !== 'rejected';
});

// ============================================================
// EXPORT MODEL
// ============================================================
module.exports = mongoose.model('User', userSchema);