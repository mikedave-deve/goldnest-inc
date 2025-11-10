const Deposit = require('../models/Deposit');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings'); // ⭐ ADDED - Settings Model
const emailService = require('../services/emailService');

const depositController = {
  // CREATE DEPOSIT REQUEST
  createDeposit: async (req, res) => {
    try {
      const { amount, currency, plan, profitPercentage } = req.body;
      const userId = req.user._id;

      // Validation
      if (!amount || !currency || !plan) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // ⭐ ADDED - Get settings for validation
      const settings = await Settings.findOne();
      const minDeposit = settings?.minDeposit || parseInt(process.env.MIN_DEPOSIT) || 50;
      const maxDeposit = parseInt(process.env.MAX_DEPOSIT) || 1000000;
      const depositFeePercent = settings?.depositFee || 0;

      // ⭐ UPDATED - Validate amount using settings
      if (amount < minDeposit || amount > maxDeposit) {
        return res.status(400).json({
          success: false,
          message: `Deposit amount must be between $${minDeposit} and $${maxDeposit}`
        });
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // ⭐ ADDED - Calculate deposit fee if enabled
      const fee = (amount * depositFeePercent) / 100;
      const netAmount = amount - fee;

      // Create deposit
      const deposit = new Deposit({
        userId,
        username: user.username,
        amount,
        currency: currency.toLowerCase(),
        plan,
        profitPercentage: profitPercentage || 0,
        expectedProfit: (amount * (profitPercentage || 0)) / 100,
        status: 'pending',
        startDate: new Date(),
        // ⭐ ADDED - Store fee information
        fee: fee,
        netAmount: netAmount
      });

      await deposit.save();

      // Send email to user
      try {
        await emailService.sendDepositPending(user.email, user.username, amount, currency, plan);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      // Send admin notification
      try {
        await emailService.sendAdminDepositNotification(user.username, amount, currency, plan);
      } catch (emailError) {
        console.error('Admin email sending failed:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Deposit request created successfully',
        deposit: deposit.getFormatted(),
        // ⭐ ADDED - Show fee information
        feeApplied: fee > 0 ? `$${fee.toFixed(2)} (${depositFeePercent}%)` : 'No fee'
      });
    } catch (error) {
      console.error('Create deposit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create deposit',
        error: error.message
      });
    }
  },

  // GET USER DEPOSITS
  getUserDeposits: async (req, res) => {
    try {
      const userId = req.user._id;

      const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });

      const totalActive = deposits
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

      res.status(200).json({
        success: true,
        deposits: deposits.map(d => d.getFormatted()),
        totalActive,
        summary: {
          total: deposits.length,
          pending: deposits.filter(d => d.status === 'pending').length,
          approved: deposits.filter(d => d.status === 'approved').length,
          rejected: deposits.filter(d => d.status === 'rejected').length
        }
      });
    } catch (error) {
      console.error('Get user deposits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deposits',
        error: error.message
      });
    }
  },

  // GET ACTIVE DEPOSITS
  getActiveDeposits: async (req, res) => {
    try {
      const userId = req.user._id;

      const activeDeposits = await Deposit.find({
        userId,
        status: 'approved'
      }).sort({ createdAt: -1 });

      const totalActive = activeDeposits.reduce((sum, d) => sum + d.amount, 0);

      res.status(200).json({
        success: true,
        deposits: activeDeposits.map(d => d.getFormatted()),
        totalActive
      });
    } catch (error) {
      console.error('Get active deposits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active deposits',
        error: error.message
      });
    }
  },

  // APPROVE DEPOSIT (Admin only)
  approveDeposit: async (req, res) => {
    try {
      const { depositId } = req.params;
      const { notes } = req.body;
      const adminId = req.user._id;

      // ⭐ ADDED - Check auto-approve setting
      const settings = await Settings.findOne();

      const deposit = await Deposit.findById(depositId).populate('userId');

      if (!deposit) {
        return res.status(404).json({
          success: false,
          message: 'Deposit not found'
        });
      }

      // Approve deposit
      await deposit.approve(adminId);
      deposit.approvalNotes = notes || '';
      await deposit.save();

      // Update user balances (use netAmount if fee was applied)
      const user = deposit.userId;
      const amountToCredit = deposit.netAmount || deposit.amount;
      
      user.totalDeposits = (user.totalDeposits || 0) + deposit.amount;
      user.activeDeposit = (user.activeDeposit || 0) + deposit.amount;
      user.accountBalance = (user.accountBalance || 0) + amountToCredit;
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        username: user.username,
        type: 'deposit',
        amount: deposit.amount,
        currency: deposit.currency,
        depositId: deposit._id,
        plan: deposit.plan,
        status: 'completed',
        description: `Deposit approved - ${deposit.plan}${deposit.fee > 0 ? ` (Fee: $${deposit.fee.toFixed(2)})` : ''}`
      });
      await transaction.save();

      // Send approval email to user
      try {
        await emailService.sendDepositApproved(
          user.email,
          user.username,
          deposit.amount,
          deposit.currency,
          deposit.plan,
          deposit.expectedProfit
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Deposit approved successfully',
        deposit: deposit.getFormatted()
      });
    } catch (error) {
      console.error('Approve deposit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve deposit',
        error: error.message
      });
    }
  },

  // REJECT DEPOSIT (Admin only)
  rejectDeposit: async (req, res) => {
    try {
      const { depositId } = req.params;
      const { reason, notes } = req.body;
      const adminId = req.user._id;

      const deposit = await Deposit.findById(depositId).populate('userId');

      if (!deposit) {
        return res.status(404).json({
          success: false,
          message: 'Deposit not found'
        });
      }

      // Reject deposit
      await deposit.reject(adminId, reason, notes);

      res.status(200).json({
        success: true,
        message: 'Deposit rejected successfully',
        deposit: deposit.getFormatted()
      });
    } catch (error) {
      console.error('Reject deposit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject deposit',
        error: error.message
      });
    }
  },

  // GET DEPOSIT BY ID
  getDepositById: async (req, res) => {
    try {
      const { depositId } = req.params;

      const deposit = await Deposit.findById(depositId).populate('userId', 'username email');

      if (!deposit) {
        return res.status(404).json({
          success: false,
          message: 'Deposit not found'
        });
      }

      res.status(200).json({
        success: true,
        deposit: deposit.getFormatted()
      });
    } catch (error) {
      console.error('Get deposit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deposit',
        error: error.message
      });
    }
  }
};

module.exports = depositController;