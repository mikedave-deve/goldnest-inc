const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    username: {
      type: String,
      required: false // Auto-populated from User
    },

    // Transaction Details
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'earning', 'commission', 'bonus', 'adjustment'],
      required: [true, 'Transaction type is required']
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },

    currency: {
      type: String,
      enum: [
        'bitcoin', 'btc',           // Bitcoin variants
        'usdt', 'tether',            // USDT variants
        'ethereum', 'eth',           // Ethereum variants
        'tron', 'trx',               // Tron variants
        'paypal',                     // PayPal
        'usd', 'dollar'              // USD variants
      ],
      required: [true, 'Currency is required'],
      lowercase: true
    },

    // Reference to related records
    depositId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deposit',
      default: null
    },

    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal',
      default: null
    },

    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // For referral commissions
    },

    // Investment Plan (for earnings)
    plan: {
      type: String,
      enum: ['BASIC PLAN', 'PROFESSIONAL PLAN', 'GOLDEN PLAN', 'VIP TRIAL PLAN', 'INVESTORS PLAN', null],
      default: null
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },

    description: {
      type: String,
      default: null
    },

    // Metadata
    date: {
      type: Date,
      default: Date.now
    },

    createdAt: {
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

transactionSchema.index({ userId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ currency: 1 });
transactionSchema.index({ date: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ username: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, date: 1 });
transactionSchema.index({ depositId: 1 });
transactionSchema.index({ withdrawalId: 1 });
transactionSchema.index({ referrerId: 1 });

// ============================================================
// STATICS - Query helpers
// ============================================================

// Get transactions by type
transactionSchema.statics.getByType = function (userId, type) {
  return this.find({ userId, type });
};

// Get transactions by date range
transactionSchema.statics.getByDateRange = function (userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Get total by type
transactionSchema.statics.getTotalByType = async function (userId, type) {
  const result = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        type: type,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Get transactions with search and filter
transactionSchema.statics.searchAndFilter = function (filters = {}) {
  const query = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.type) query.type = filters.type;
  if (filters.currency) query.currency = filters.currency;
  if (filters.status) query.status = filters.status;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
  }

  return this.find(query).sort({ date: -1 });
};

// ============================================================
// METHODS
// ============================================================

// Get formatted transaction
transactionSchema.methods.getFormatted = function () {
  return {
    id: this._id,
    userId: this.userId,
    username: this.username,
    type: this.type,
    amount: this.amount,
    currency: this.currency,
    plan: this.plan,
    status: this.status,
    description: this.description,
    date: this.date,
    createdAt: this.createdAt
  };
};

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model('Transaction', transactionSchema);