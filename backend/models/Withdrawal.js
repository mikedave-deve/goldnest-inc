const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },

    username: {
      type: String,
      required: true
    },

    // Withdrawal Details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Withdrawal amount must be at least $1'],
      max: [50000, 'Withdrawal amount cannot exceed $50,000']
    },

    currency: {
      type: String,
      enum: ['bitcoin', 'usdt', 'ethereum', 'tron', 'paypal'],
      required: [true, 'Currency is required'],
      lowercase: true
    },

    walletAddress: {
      type: String,
      required: [true, 'Wallet address is required'],
      trim: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected', 'completed', 'failed'],
      default: 'pending'
    },

    rejectionReason: {
      type: String,
      default: null
    },

    // Admin Actions
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    processedDate: {
      type: Date,
      default: null
    },

    processingNotes: {
      type: String,
      default: null
    },

    // Processing
    confirmationClicks: {
      type: Number,
      default: 0,
      min: 0,
      max: 2
    },

    lastClickDate: {
      type: Date,
      default: null
    },

    requestedDate: {
      type: Date,
      default: Date.now
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

withdrawalSchema.index({ userId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ currency: 1 });
withdrawalSchema.index({ createdAt: 1 });
withdrawalSchema.index({ username: 1 });
withdrawalSchema.index({ userId: 1, status: 1 });

// ============================================================
// MIDDLEWARE
// ============================================================

// Generate transaction ID if not provided
withdrawalSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `WD-${timestamp}-${random}`;
  }

  this.updatedAt = Date.now();
  next();
});

// ============================================================
// VIRTUAL PROPERTIES
// ============================================================

// Get hours since request
withdrawalSchema.virtual('hoursSinceRequest').get(function () {
  const now = new Date();
  const diff = now - this.requestedDate;
  return Math.floor(diff / (1000 * 60 * 60));
});

// Check if pending
withdrawalSchema.virtual('isPending').get(function () {
  return this.status === 'pending';
});

// ============================================================
// METHODS
// ============================================================

// Record confirmation click
withdrawalSchema.methods.recordClick = function () {
  this.confirmationClicks = (this.confirmationClicks || 0) + 1;
  this.lastClickDate = new Date();
  
  // Only mark as ready if exactly 2 clicks
  if (this.confirmationClicks === 2) {
    this.status = 'processing';
  }
  
  return this.save();
};

// Approve withdrawal
withdrawalSchema.methods.approve = function (adminId, notes = '') {
  this.status = 'approved';
  this.processedBy = adminId;
  this.processedDate = new Date();
  this.processingNotes = notes;
  return this.save();
};

// Reject withdrawal
withdrawalSchema.methods.reject = function (adminId, reason = '', notes = '') {
  this.status = 'rejected';
  this.processedBy = adminId;
  this.processedDate = new Date();
  this.rejectionReason = reason;
  this.processingNotes = notes;
  return this.save();
};

// Mark as completed
withdrawalSchema.methods.complete = function () {
  this.status = 'completed';
  this.processedDate = new Date();
  return this.save();
};

// Get formatted withdrawal data
withdrawalSchema.methods.getFormatted = function () {
  return {
    id: this._id,
    userId: this.userId,
    username: this.username,
    amount: this.amount,
    currency: this.currency,
    walletAddress: this.walletAddress,
    status: this.status,
    transactionId: this.transactionId,
    requestedDate: this.requestedDate,
    processedDate: this.processedDate,
    hoursSinceRequest: this.hoursSinceRequest,
    createdAt: this.createdAt
  };
};

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model('Withdrawal', withdrawalSchema);