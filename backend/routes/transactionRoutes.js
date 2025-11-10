const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// ============================================================
// IMPORTANT: Specific routes MUST come BEFORE parameterized routes!
// ============================================================

// USER ROUTES - Specific paths first
router.get('/history', authenticate, transactionController.getHistory);
router.get('/search', authenticate, transactionController.searchTransactions);
router.get('/filter', authenticate, transactionController.filterTransactions);
router.get('/statistics', authenticate, transactionController.getStatistics);

// ADMIN ROUTES - Specific paths (must be before /:id routes)
router.get('/all', authenticate, isAdmin, transactionController.getAllTransactions);
router.post('/create', authenticate, isAdmin, transactionController.createTransaction);

// PARAMETERIZED ROUTES - Must be LAST to avoid conflicts
// These will match /transactions/:id where :id is an actual MongoDB ObjectId
router.get('/:transactionId', authenticate, transactionController.getTransactionById);
router.put('/:id', authenticate, isAdmin, transactionController.updateTransaction);
router.delete('/:id', authenticate, isAdmin, transactionController.deleteTransaction);

module.exports = router;