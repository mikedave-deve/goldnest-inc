// routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

/**
 * @route   POST /api/support/contact
 * @desc    Submit contact form (sends email to admin)
 * @access  Public
 */
router.post('/contact', supportController.submitContactForm);

module.exports = router;