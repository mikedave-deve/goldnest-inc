// scripts/addReferralCodes.js
// Run this ONCE to add referral codes to existing users

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Generate unique referral code
 */
const generateReferralCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Generate 8-character code
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Check if code already exists
  const existingUser = await User.findOne({ referralCode: code });
  
  if (existingUser) {
    // If code exists, generate a new one recursively
    return generateReferralCode();
  }
  
  return code;
};

/**
 * Add referral codes to all users who don't have one
 */
const addReferralCodes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnest-investment-platform';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    console.log('🔍 Finding users without referral codes...\n');

    // Find all users without referral codes
    const usersWithoutCodes = await User.find({
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: '' }
      ]
    });

    console.log(`📊 Found ${usersWithoutCodes.length} users without referral codes\n`);

    if (usersWithoutCodes.length === 0) {
      console.log('✅ All users already have referral codes!');
      process.exit(0);
    }

    // Add referral codes to users
    let updated = 0;
    for (const user of usersWithoutCodes) {
      const code = await generateReferralCode();
      user.referralCode = code;
      
      // Initialize referral fields if they don't exist
      if (user.referralEarnings === undefined) user.referralEarnings = 0;
      if (user.totalCommission === undefined) user.totalCommission = 0;
      
      await user.save();
      updated++;
      console.log(`✅ [${updated}/${usersWithoutCodes.length}] Added code ${code} to user: ${user.username}`);
    }

    console.log(`\n🎉 Successfully added referral codes to ${updated} users!`);
    
    // Disconnect
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
addReferralCodes();