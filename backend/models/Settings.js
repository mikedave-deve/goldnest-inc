// models/Settings.js - Platform Settings Model
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  siteName: {
    type: String,
    default: 'GoldNest Inc'
  },
  siteEmail: {
    type: String,
    default: 'support@goldnest-inc.biz'
  },

  // Transaction Limits
  minDeposit: {
    type: Number,
    default: 50,
    min: 0
  },
  minWithdrawal: {
    type: Number,
    default: 1,
    min: 0
  },

  // Fees (in percentage)
  depositFee: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  withdrawalFee: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Referral Settings
  referralCommission: {
    type: Number,
    default: 7,
    min: 0,
    max: 100
  },

  // Feature Toggles
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  autoApproveDeposits: {
    type: Boolean,
    default: false
  },
  autoApproveWithdrawals: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists (Singleton pattern)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Instance method to update settings
settingsSchema.methods.updateSettings = async function(updates) {
  Object.assign(this, updates);
  await this.save();
  return this;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;