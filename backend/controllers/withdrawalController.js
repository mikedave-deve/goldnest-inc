const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings'); // ⭐ ADDED - Settings Model
const emailService = require('../services/emailService');

const withdrawalController = {
  // REQUEST WITHDRAWAL
  requestWithdrawal: async (req, res) => {
    try {
      const { amount, currency, walletAddress } = req.body;
      const userId = req.user._id;

      // Validation
      if (!amount || !currency || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
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

      // ⭐ ADDED - Get settings for validation
      const settings = await Settings.findOne();
      const minWithdrawal = settings?.minWithdrawal || parseInt(process.env.MIN_WITHDRAWAL) || 1;
      const maxWithdrawal = parseInt(process.env.MAX_WITHDRAWAL) || 1000000;
      const withdrawalFeePercent = settings?.withdrawalFee || 0;
      const autoApprove = settings?.autoApproveWithdrawals || false;

      // ⭐ UPDATED - Validate amount using settings
      if (amount < minWithdrawal || amount > maxWithdrawal) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal amount must be between $${minWithdrawal} and $${maxWithdrawal}`
        });
      }

      // ⭐ ADDED - Calculate withdrawal fee
      const fee = (amount * withdrawalFeePercent) / 100;
      const netAmount = amount - fee;
      const totalRequired = amount; // User pays the fee

      // Check if user has sufficient balance
      if (user.accountBalance < totalRequired) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance for withdrawal'
        });
      }

      // ⭐ UPDATED - Set initial status based on auto-approve setting
      const initialStatus = autoApprove ? 'approved' : 'pending';

      // Create withdrawal request
      const withdrawal = new Withdrawal({
        userId,
        username: user.username,
        amount,
        currency: currency.toLowerCase(),
        walletAddress,
        status: initialStatus,
        requestedDate: new Date(),
        // ⭐ ADDED - Store fee information
        fee: fee,
        netAmount: netAmount,
        // ⭐ ADDED - Auto-approve info
        ...(autoApprove && {
          approvedAt: new Date(),
          approvedBy: 'System (Auto-approved)'
        })
      });

      await withdrawal.save();

      // ⭐ ADDED - If auto-approved, update user balance immediately
      if (autoApprove) {
        user.accountBalance = Math.max(0, (user.accountBalance || 0) - totalRequired);
        user.totalWithdraw = (user.totalWithdraw || 0) + amount;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
          userId: user._id,
          username: user.username,
          type: 'withdrawal',
          amount: amount,
          currency: currency.toLowerCase(),
          withdrawalId: withdrawal._id,
          status: 'completed',
          description: `Auto-approved withdrawal - ${currency.toUpperCase()}${fee > 0 ? ` (Fee: $${fee.toFixed(2)})` : ''}`
        });
        await transaction.save();
      }

      // Send email to user
      try {
        if (autoApprove) {
          await emailService.sendWithdrawalApproved(
            user.email,
            user.username,
            amount,
            currency,
            walletAddress
          );
        } else {
          await emailService.sendWithdrawalRequested(
            user.email,
            user.username,
            amount,
            currency,
            walletAddress
          );
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      // SEND EMAIL TO ADMIN
      try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourapp.com';
        await emailService.sendAdminWithdrawalNotification(
          adminEmail,
          user.username,
          amount,
          currency,
          walletAddress,
          withdrawal._id
        );
      } catch (emailError) {
        console.error('Admin email sending failed:', emailError);
      }

      res.status(201).json({
        success: true,
        message: autoApprove 
          ? 'Withdrawal approved automatically. Funds will be sent shortly.'
          : 'Withdrawal request submitted. Please confirm by clicking the button again.',
        withdrawal: withdrawal.getFormatted(),
        // ⭐ ADDED - Show fee information
        feeApplied: fee > 0 ? `$${fee.toFixed(2)} (${withdrawalFeePercent}%)` : 'No fee',
        netAmount: `$${netAmount.toFixed(2)}`
      });
    } catch (error) {
      console.error('Request withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to request withdrawal',
        error: error.message
      });
    }
  },

  // CONFIRM WITHDRAWAL (Two-click system)
  confirmWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;

      const withdrawal = await Withdrawal.findById(withdrawalId);

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        });
      }

      // Record the click
      await withdrawal.recordClick();

      // Check if ready for processing
      if (withdrawal.confirmationClicks < 2) {
        return res.status(200).json({
          success: true,
          message: `Withdrawal confirmation ${withdrawal.confirmationClicks}/2. Please click again to confirm.`,
          withdrawal: withdrawal.getFormatted()
        });
      }

      // IMPORTANT: After 2 clicks, update status to 'confirmed' so admin can see it
      withdrawal.status = 'confirmed';
      withdrawal.confirmedAt = new Date();
      await withdrawal.save();

      res.status(200).json({
        success: true,
        message: 'Withdrawal confirmed and submitted for admin review',
        withdrawal: withdrawal.getFormatted()
      });
    } catch (error) {
      console.error('Confirm withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm withdrawal',
        error: error.message
      });
    }
  },

  // GET USER WITHDRAWALS
  getUserWithdrawals: async (req, res) => {
    try {
      const userId = req.user._id;

      const withdrawals = await Withdrawal.find({ userId }).sort({ requestedDate: -1 });

      res.status(200).json({
        success: true,
        withdrawals: withdrawals.map(w => w.getFormatted()),
        summary: {
          total: withdrawals.length,
          pending: withdrawals.filter(w => w.status === 'pending').length,
          processing: withdrawals.filter(w => w.status === 'processing').length,
          approved: withdrawals.filter(w => w.status === 'approved').length,
          rejected: withdrawals.filter(w => w.status === 'rejected').length,
          completed: withdrawals.filter(w => w.status === 'completed').length
        }
      });
    } catch (error) {
      console.error('Get user withdrawals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawals',
        error: error.message
      });
    }
  },

  // GET ALL WITHDRAWALS (Admin only)
  getAllWithdrawals: async (req, res) => {
    try {
      const { status } = req.query;
      
      const filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }

      const withdrawals = await Withdrawal.find(filter)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

      // Format response to match frontend expectations
      const formattedWithdrawals = withdrawals.map(w => ({
        _id: w._id,
        user: {
          username: w.userId?.username || w.username,
          email: w.userId?.email || 'N/A'
        },
        amount: w.amount,
        currency: w.currency,
        walletAddress: w.walletAddress,
        status: w.status,
        createdAt: w.createdAt || w.requestedDate,
        confirmedAt: w.confirmedAt,
        approvedAt: w.approvedAt,
        completedAt: w.completedAt,
        rejectedAt: w.rejectedAt,
        transactionHash: w.transactionHash,
        rejectReason: w.rejectReason,
        confirmationClicks: w.confirmationClicks,
        // ⭐ ADDED - Include fee information
        fee: w.fee || 0,
        netAmount: w.netAmount || w.amount
      }));

      res.status(200).json({
        success: true,
        withdrawals: formattedWithdrawals
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

  // APPROVE WITHDRAWAL (Admin only)
  approveWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { notes } = req.body;
      const adminId = req.user._id;

      const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        });
      }

      // Check if already processed
      if (withdrawal.status === 'approved' || withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: `Withdrawal already ${withdrawal.status}`
        });
      }

      // Approve withdrawal
      await withdrawal.approve(adminId, notes);

      // Update user balance (use total amount including fee)
      const user = withdrawal.userId;
      const totalDeducted = withdrawal.amount;
      
      user.accountBalance = Math.max(0, (user.accountBalance || 0) - totalDeducted);
      user.totalWithdraw = (user.totalWithdraw || 0) + withdrawal.amount;
      await user.save();

      // Create transaction record
      const transaction = new Transaction({
        userId: user._id,
        username: user.username,
        type: 'withdrawal',
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        withdrawalId: withdrawal._id,
        status: 'completed',
        description: `Withdrawal approved - ${withdrawal.currency.toUpperCase()}${withdrawal.fee > 0 ? ` (Fee: $${withdrawal.fee.toFixed(2)})` : ''}`
      });
      await transaction.save();

      // Send approval email
      try {
        await emailService.sendWithdrawalApproved(
          user.email,
          user.username,
          withdrawal.amount,
          withdrawal.currency,
          withdrawal.walletAddress
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Withdrawal approved successfully',
        withdrawal: withdrawal.getFormatted ? withdrawal.getFormatted() : withdrawal
      });
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve withdrawal',
        error: error.message
      });
    }
  },

  // COMPLETE WITHDRAWAL (Admin only) - NEW METHOD
  completeWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { transactionHash } = req.body;

      if (!transactionHash || !transactionHash.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        });
      }

      // Check if withdrawal is in a state that can be completed
      if (withdrawal.status !== 'approved' && withdrawal.status !== 'processing') {
        return res.status(400).json({
          success: false,
          message: `Cannot complete withdrawal with status: ${withdrawal.status}`
        });
      }

      // Update withdrawal to completed
      withdrawal.status = 'completed';
      withdrawal.completedAt = new Date();
      withdrawal.transactionHash = transactionHash;
      await withdrawal.save();

      // Send completion email to user
      const user = withdrawal.userId;
      try {
        await emailService.sendWithdrawalCompleted(
          user.email,
          user.username,
          withdrawal.amount,
          withdrawal.currency,
          transactionHash
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Withdrawal marked as completed',
        withdrawal: withdrawal.getFormatted ? withdrawal.getFormatted() : withdrawal
      });
    } catch (error) {
      console.error('Complete withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete withdrawal',
        error: error.message
      });
    }
  },

  // REJECT WITHDRAWAL (Admin only)
  rejectWithdrawal: async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      const { reason, notes } = req.body;
      const adminId = req.user._id;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        });
      }

      // Check if already processed
      if (withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
        return res.status(400).json({
          success: false,
          message: `Withdrawal already ${withdrawal.status}`
        });
      }

      // Get user details
      const user = withdrawal.userId;

      // Reject withdrawal
      await withdrawal.reject(adminId, reason, notes);

      // Send rejection email
      try {
        await emailService.sendWithdrawalRejected(
          user.email,
          user.username,
          withdrawal.amount,
          withdrawal.currency,
          reason
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Withdrawal rejected',
        withdrawal: withdrawal.getFormatted ? withdrawal.getFormatted() : withdrawal
      });
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject withdrawal',
        error: error.message
      });
    }
  },

  // GET WITHDRAWAL BY ID
  getWithdrawalById: async (req, res) => {
    try {
      const { withdrawalId } = req.params;

      const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId', 'username email');

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal not found'
        });
      }

      res.status(200).json({
        success: true,
        withdrawal: withdrawal.getFormatted ? withdrawal.getFormatted() : withdrawal
      });
    } catch (error) {
      console.error('Get withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch withdrawal',
        error: error.message
      });
    }
  }
};

module.exports = withdrawalController;