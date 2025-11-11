// controllers/supportController.js
const emailService = require('../services/emailService');

/**
 * @desc    Handle contact form submission
 * @route   POST /api/support/contact
 * @access  Public
 */
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Message length validation
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long'
      });
    }

    console.log('📧 Processing contact form from:', email);

    // Send email to admin ONLY
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@goldnest-inc.com';
    
    try {
      if (emailService && emailService.sendSupportEmail) {
        await emailService.sendSupportEmail(adminEmail, name, email, message);
        console.log('✅ Support email sent to admin');
      } else {
        console.warn('⚠️ Email service not configured');
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will respond within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again later.'
    });
  }
};

module.exports = exports;