const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    // Username for quick display in admin
    username: {
      type: String,
      required: [true, 'Username is required']
    },

    // Deposit Details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Deposit amount must be at least $1'],
      max: [100000, 'Deposit amount cannot exceed $100,000']
    },

    currency: {
      type: String,
      enum: ['bitcoin', 'usdt', 'ethereum', 'tron', 'paypal'],
      required: [true, 'Currency is required'],
      lowercase: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Investment Plan
    plan: {
      type: String,
      enum: ['BASIC PLAN', 'PROFESSIONAL PLAN', 'GOLDEN PLAN', 'VIP TRIAL PLAN', 'INVESTORS PLAN'],
      required: [true, 'Investment plan is required']
    },

    // Profit/Returns Information
    profitPercentage: {
      type: Number,
      default: 0,
      min: 0
    },

    expectedProfit: {
      type: Number,
      default: 0,
      min: 0
    },

    actualProfit: {
      type: Number,
      default: 0,
      min: 0
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
      default: 'pending'
    },

    approvalNotes: {
      type: String,
      default: null
    },

    // Maturity/Duration
    startDate: {
      type: Date,
      default: Date.now
    },

    maturityDate: {
      type: Date,
      default: null
    },

    duration: {
      type: Number, // in days
      default: 365
    },

    // Admin Actions
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    approvalDate: {
      type: Date,
      default: null
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ============================================================
// INDEXES
// ============================================================

depositSchema.index({ userId: 1 });
depositSchema.index({ status: 1 });
depositSchema.index({ currency: 1 });
depositSchema.index({ createdAt: 1 });
depositSchema.index({ maturityDate: 1 });
depositSchema.index({ userId: 1, status: 1 });

// ============================================================
// MIDDLEWARE
// ============================================================

// Generate transaction ID if not provided
depositSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `DEP-${timestamp}-${random}`;
  }

  // Calculate maturity date if not set
  if (!this.maturityDate && this.duration) {
    const maturity = new Date(this.startDate);
    maturity.setDate(maturity.getDate() + this.duration);
    this.maturityDate = maturity;
  }

  // Update lastModified timestamp
  this.updatedAt = Date.now();

  next();
});

// ============================================================
// VIRTUAL PROPERTIES
// ============================================================

// Calculate remaining days until maturity
depositSchema.virtual('daysRemaining').get(function () {
  if (!this.maturityDate) return 0;
  const today = new Date();
  const diff = this.maturityDate - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Check if deposit is mature
depositSchema.virtual('isMature').get(function () {
  return this.maturityDate && this.maturityDate <= new Date();
});

// ============================================================
// METHODS
// ============================================================

// Method to approve deposit
depositSchema.methods.approve = function (adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvalDate = new Date();
  return this.save();
};

// Method to reject deposit
depositSchema.methods.reject = function (adminId, notes = '') {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.approvalDate = new Date();
  this.approvalNotes = notes;
  return this.save();
};

// Get formatted deposit data
depositSchema.methods.getFormatted = function () {
  return {
    id: this._id,
    userId: this.userId,
    amount: this.amount,
    currency: this.currency,
    plan: this.plan,
    status: this.status,
    profitPercentage: this.profitPercentage,
    expectedProfit: this.expectedProfit,
    startDate: this.startDate,
    maturityDate: this.maturityDate,
    daysRemaining: this.daysRemaining,
    isMature: this.isMature,
    transactionId: this.transactionId,
    createdAt: this.createdAt
  };
};

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model('Deposit', depositSchema);