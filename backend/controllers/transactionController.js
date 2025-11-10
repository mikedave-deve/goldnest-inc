const Transaction = require('../models/Transaction');
const User = require('../models/User');

const transactionController = {
  // ============================================================
  // USER TRANSACTION METHODS
  // ============================================================

  // GET TRANSACTION HISTORY
  getHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20, type, status } = req.query;

      const skip = (page - 1) * limit;

      // Build filter
      const filter = { userId };
      if (type) filter.type = type;
      if (status) filter.status = status;

      const transactions = await Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(filter);

      res.status(200).json({
        success: true,
        transactions: transactions.map(t => t.getFormatted ? t.getFormatted() : t),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction history',
        error: error.message
      });
    }
  },

  // SEARCH TRANSACTIONS
  searchTransactions: async (req, res) => {
    try {
      const userId = req.user._id;
      const { query, type, currency, status } = req.query;

      const filter = { userId };

      if (type) filter.type = type;
      if (currency) filter.currency = currency;
      if (status) filter.status = status;

      if (query) {
        filter.$or = [
          { username: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { transactionId: { $regex: query, $options: 'i' } }
        ];
      }

      const transactions = await Transaction.find(filter).sort({ date: -1 });

      res.status(200).json({
        success: true,
        transactions: transactions.map(t => t.getFormatted ? t.getFormatted() : t),
        count: transactions.length
      });
    } catch (error) {
      console.error('Search transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search transactions',
        error: error.message
      });
    }
  },

  // FILTER TRANSACTIONS
  filterTransactions: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        type,
        currency,
        status,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        page = 1,
        limit = 20
      } = req.query;

      const skip = (page - 1) * limit;

      const filters = {
        userId,
        ...(type && { type }),
        ...(currency && { currency }),
        ...(status && { status })
      };

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.$gte = new Date(startDate);
        if (endDate) filters.date.$lte = new Date(endDate);
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        filters.amount = {};
        if (minAmount !== undefined) filters.amount.$gte = parseFloat(minAmount);
        if (maxAmount !== undefined) filters.amount.$lte = parseFloat(maxAmount);
      }

      const transactions = await Transaction.find(filters)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(filters);

      // Calculate statistics
      const stats = await Transaction.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        transactions: transactions.map(t => t.getFormatted ? t.getFormatted() : t),
        statistics: stats.length > 0 ? stats[0] : null,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Filter transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to filter transactions',
        error: error.message
      });
    }
  },

  // GET TRANSACTION STATISTICS
  getStatistics: async (req, res) => {
    try {
      const userId = req.user._id;

      const stats = await Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            avg: { $avg: '$amount' }
          }
        }
      ]);

      const currencyStats = await Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$currency',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const monthlyStats = await Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              year: { $year: '$date' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
      ]);

      res.status(200).json({
        success: true,
        statistics: {
          byType: stats,
          byCurrency: currencyStats,
          byMonth: monthlyStats
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  // GET TRANSACTION BY ID
  getTransactionById: async (req, res) => {
    try {
      const { transactionId, id } = req.params;
      const finalId = transactionId || id;
      const userId = req.user._id;
      const isAdminUser = req.user.role === 'admin';

      // Build query - admins can see all transactions
      const query = isAdminUser 
        ? { _id: finalId }
        : { _id: finalId, userId };

      const transaction = await Transaction.findOne(query)
        .populate('userId', 'username email');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        transaction: transaction.getFormatted ? transaction.getFormatted() : transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        error: error.message
      });
    }
  },

  // ============================================================
  // ADMIN TRANSACTION METHODS
  // ============================================================

  // GET ALL TRANSACTIONS (Admin)
  getAllTransactions: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        status, 
        userId, 
        startDate, 
        endDate 
      } = req.query;

      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (userId) filter.userId = userId;

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      const transactions = await Transaction.find(filter)
        .populate('userId', 'username email')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Transaction.countDocuments(filter);

      // Calculate summary statistics
      const summary = await Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDeposits: {
              $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0] }
            },
            totalWithdrawals: {
              $sum: { $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0] }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        transactions: transactions.map(t => ({
          _id: t._id,
          user: {
            _id: t.userId?._id,
            username: t.userId?.username || t.username,
            email: t.userId?.email
          },
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          description: t.description,
          date: t.date || t.createdAt,
          createdAt: t.createdAt
        })),
        summary: summary.length > 0 ? summary[0] : {
          totalAmount: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          count: 0
        },
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

  // CREATE TRANSACTION (Admin)
  createTransaction: async (req, res) => {
    try {
      const { userId, type, amount, currency, description, status } = req.body;

      // Validation
      if (!userId || !type || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Please provide userId, type, and amount'
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create transaction
      const transaction = new Transaction({
        userId,
        username: user.username,
        type,
        amount,
        currency: currency || 'usd',
        description: description || `${type} transaction`,
        status: status || 'completed',
        date: new Date()
      });

      await transaction.save();

      // Update user balance if needed
      if (status === 'completed') {
        if (type === 'deposit' || type === 'profit' || type === 'bonus') {
          user.accountBalance = (user.accountBalance || 0) + amount;
          await user.save();
        }
      }

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        transaction: transaction.getFormatted ? transaction.getFormatted() : transaction
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

  // UPDATE TRANSACTION (Admin)
  updateTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const transaction = await Transaction.findById(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['amount', 'currency', 'description', 'status', 'type'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          transaction[field] = updates[field];
        }
      });

      await transaction.save();

      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        transaction: transaction.getFormatted ? transaction.getFormatted() : transaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction',
        error: error.message
      });
    }
  },

  // DELETE TRANSACTION (Admin)
  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByIdAndDelete(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  }
};

module.exports = transactionController;