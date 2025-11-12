const User = require('../models/User');
const Referral = require('../models/Referral');
const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const generateRandomPassword = (length = 12) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ============================================================
// @route   POST /api/auth/register
// @desc    Register new user (REQUIRES ADMIN APPROVAL)
// @access  Public
// ============================================================

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, referralCode, fullName, phone } = req.body;

    // Check if registration is allowed
    const settings = await Settings.findOne();
    if (settings && !settings.allowRegistration) {
      return res.status(403).json({
        success: false,
        message: 'Registration is currently disabled. Please contact support.',
      });
    }

    // Validation
    if (!username || !email || !password || !fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: username, email, password, fullName, phone',
      });
    }

    // Check password match
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
    }

    // Create user with 'pending' status
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      fullName,
      phone,
      status: 'pending',
      role: 'user',
      accountBalance: 0,
      earnedTotal: 0,
      totalDeposits: 0,
      activeDeposit: 0,
      totalWithdraw: 0,
      btcBalance: 0,
      usdtBalance: 0,
      ethBalance: 0,
      trxBalance: 0,
    });

    console.log('✅ User registered (pending approval):', user.username, user.email);

    // Handle referral code
    if (referralCode) {
      user.tempReferralCode = referralCode;
      await user.save({ validateBeforeSave: false });
      console.log('✓ Referral code stored:', referralCode);
    }

    // Send emails asynchronously
    if (emailService) {
      Promise.all([
        emailService.sendRegistrationPending && emailService.sendRegistrationPending(user.email, user.username)
          .then(() => console.log('✅ Pending approval email sent to:', user.email))
          .catch(err => console.error('❌ Failed to send pending email:', err.message)),
        
        emailService.sendAdminNewUserNotification && emailService.sendAdminNewUserNotification(user.username, user.email)
          .then(() => console.log('✅ Admin notification sent'))
          .catch(err => console.error('❌ Failed to send admin notification:', err.message))
      ]).catch(err => console.error('Email sending error:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval. You will receive an email once approved.',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// ============================================================
// @route   POST /api/auth/login
// @desc    Login user (ONLY APPROVED USERS)
// @access  Public
// ============================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('✓ User found:', user.username, '- Status:', user.status);

    // Check account status BEFORE password verification
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will receive an email once approved.',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration was rejected. Please contact support for more information.',
        status: 'rejected'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        status: 'suspended'
      });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Account access denied. Please contact support.',
      });
    }

    // Verify password
    let isPasswordValid = false;
    try {
      if (typeof user.comparePassword === 'function') {
        isPasswordValid = await user.comparePassword(password);
      } else {
        const bcrypt = require('bcryptjs');
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('⚠️ Using bcrypt fallback');
      }
    } catch (compareError) {
      console.error('❌ Password comparison error:', compareError);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(user._id);

    console.log('✅ User logged in:', user.username);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        accountBalance: user.accountBalance || 0,
        btcBalance: user.btcBalance || 0,
        usdtBalance: user.usdtBalance || 0,
        ethBalance: user.ethBalance || 0,
        trxBalance: user.trxBalance || 0,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// ============================================================
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
// ============================================================

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message,
    });
  }
};

// ============================================================
// @route   PUT /api/auth/change-password
// @desc    Change user password (FROM PROFILE SETTINGS)
// @access  Private
// ============================================================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();

    console.log('✅ Password changed for user:', user.username);

    // Send security alert email
    if (emailService && emailService.sendPasswordChanged) {
      const userIP = req.ip || req.connection.remoteAddress || 'unknown';
      emailService.sendPasswordChanged(user.email, user.username, userIP)
        .then(() => console.log('✅ Password change email sent'))
        .catch(err => console.error('❌ Failed to send password change email:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

// ============================================================
// @route   POST /api/auth/forgot-password
// @desc    Step 1: Request password reset - send email with link
// @access  Public
// ============================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    console.log('✅ Password reset token generated for:', user.username);

    // Send reset request email with link
    if (emailService && emailService.sendPasswordResetRequest) {
      try {
        await emailService.sendPasswordResetRequest(user.email, user.username, resetToken);
        console.log('✅ Password reset email sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError.message);
        // Continue even if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message,
    });
  }
};

// ============================================================
// @route   POST /api/auth/reset-password/:token
// @desc    Step 2: Confirm reset and generate new password
// @access  Public
// ============================================================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      });
    }

    // Generate new secure password
    const newPassword = generateRandomPassword(12);

    // Update user password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.lastPasswordChange = Date.now();
    await user.save();

    console.log('✅ Password reset completed for user:', user.username);

    // Send new password email
    if (emailService && emailService.sendNewPasswordEmail) {
      try {
        await emailService.sendNewPasswordEmail(user.email, user.username, newPassword);
        console.log('✅ New password email sent to:', user.email);
      } catch (emailError) {
        console.error('❌ Failed to send new password email:', emailError.message);
        // Still return success to user
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful! Check your email for your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

// ============================================================
// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Public
// ============================================================

exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};