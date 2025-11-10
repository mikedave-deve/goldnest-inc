// scripts/syncReferralRecords.js
// Run this script ONCE to ensure all users have proper Referral records
// This script syncs User and Referral models for all existing users

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Referral = require('../models/Referral');

/**
 * Sync all users with Referral records
 * - Creates Referral records for users who don't have one
 * - Updates existing Referral records to match User data
 * - Ensures referral codes are consistent
 */
const syncReferralRecords = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnest-investment-platform';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    console.log('🔄 Starting referral synchronization...\n');

    // Get all users
    const users = await User.find({})
      .select('_id username referralCode referredBy referralEarnings totalCommission')
      .lean();

    console.log(`📊 Found ${users.length} total users\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each user
    for (const user of users) {
      try {
        // Skip users without referral code
        if (!user.referralCode) {
          console.log(`⚠️  [${user.username}] No referral code - skipping`);
          skipped++;
          continue;
        }

        // Check if Referral record exists
        let referral = await Referral.findOne({ userId: user._id });

        if (!referral) {
          // CREATE NEW REFERRAL RECORD
          console.log(`➕ [${user.username}] Creating new Referral record...`);
          
          // Count referrals for this user
          const referredCount = await User.countDocuments({
            referredBy: user._id
          });
          
          const activeCount = await User.countDocuments({
            referredBy: user._id,
            status: 'approved',
            totalDeposits: { $gt: 0 }
          });

          referral = await Referral.create({
            userId: user._id,
            referralCode: user.referralCode,
            referredBy: user.referredBy || null,
            referralsCount: referredCount,
            activeReferrals: activeCount,
            totalCommission: user.totalCommission || 0,
            referralEarnings: user.referralEarnings || 0
          });

          console.log(`   ✅ Created: ${user.referralCode} (${referredCount} referrals)`);
          created++;
        } else {
          // UPDATE EXISTING REFERRAL RECORD
          let needsUpdate = false;
          const updates = {};

          // Check referral code
          if (referral.referralCode !== user.referralCode) {
            updates.referralCode = user.referralCode;
            needsUpdate = true;
            console.log(`   📝 Updating referral code: ${referral.referralCode} → ${user.referralCode}`);
          }

          // Check total commission
          if (referral.totalCommission !== (user.totalCommission || 0)) {
            updates.totalCommission = user.totalCommission || 0;
            needsUpdate = true;
            console.log(`   📝 Updating totalCommission: ${referral.totalCommission} → ${user.totalCommission || 0}`);
          }

          // Check referral earnings
          if (referral.referralEarnings !== (user.referralEarnings || 0)) {
            updates.referralEarnings = user.referralEarnings || 0;
            needsUpdate = true;
            console.log(`   📝 Updating referralEarnings: ${referral.referralEarnings} → ${user.referralEarnings || 0}`);
          }

          // Check referredBy
          const userReferredBy = user.referredBy ? user.referredBy.toString() : null;
          const refReferredBy = referral.referredBy ? referral.referredBy.toString() : null;
          
          if (userReferredBy !== refReferredBy) {
            updates.referredBy = user.referredBy || null;
            needsUpdate = true;
            console.log(`   📝 Updating referredBy`);
          }

          // Update referral counts
          const referredCount = await User.countDocuments({
            referredBy: user._id
          });
          
          const activeCount = await User.countDocuments({
            referredBy: user._id,
            status: 'approved',
            totalDeposits: { $gt: 0 }
          });

          if (referral.referralsCount !== referredCount) {
            updates.referralsCount = referredCount;
            needsUpdate = true;
            console.log(`   📝 Updating referralsCount: ${referral.referralsCount} → ${referredCount}`);
          }

          if (referral.activeReferrals !== activeCount) {
            updates.activeReferrals = activeCount;
            needsUpdate = true;
            console.log(`   📝 Updating activeReferrals: ${referral.activeReferrals} → ${activeCount}`);
          }

          if (needsUpdate) {
            await Referral.updateOne({ userId: user._id }, { $set: updates });
            console.log(`   ✅ [${user.username}] Updated Referral record`);
            updated++;
          } else {
            console.log(`   ⏭️  [${user.username}] Already in sync - skipped`);
            skipped++;
          }
        }

      } catch (userError) {
        console.error(`   ❌ [${user.username}] Error:`, userError.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNCHRONIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Users:           ${users.length}`);
    console.log(`✅ Created:            ${created}`);
    console.log(`📝 Updated:            ${updated}`);
    console.log(`⏭️  Skipped:            ${skipped}`);
    console.log(`❌ Errors:             ${errors}`);
    console.log('='.repeat(60));

    // Verify sync
    console.log('\n🔍 Verifying synchronization...');
    
    const totalUsers = await User.countDocuments({ 
      referralCode: { $exists: true, $ne: null, $ne: '' } 
    });
    
    const totalReferrals = await Referral.countDocuments();
    
    console.log(`\n📊 Verification Results:`);
    console.log(`   Users with referral codes: ${totalUsers}`);
    console.log(`   Referral records:          ${totalReferrals}`);
    
    if (totalUsers === totalReferrals) {
      console.log('\n✅ SUCCESS! All users are properly synced!');
    } else {
      console.log(`\n⚠️  WARNING: Mismatch detected!`);
      console.log(`   Missing records: ${totalUsers - totalReferrals}`);
    }

    console.log('\n🎉 Synchronization complete!\n');
    
    // Disconnect
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('❌ Error closing connection:', closeError.message);
    }
    
    process.exit(1);
  }
};

// Run the script
console.log('\n' + '='.repeat(60));
console.log('🚀 REFERRAL SYNCHRONIZATION SCRIPT');
console.log('='.repeat(60));
console.log('This script will:');
console.log('  1. Find all users with referral codes');
console.log('  2. Create Referral records for users without one');
console.log('  3. Update existing Referral records to match User data');
console.log('  4. Ensure all referral codes are consistent\n');
console.log('Press Ctrl+C to cancel...\n');

// Wait 3 seconds before starting
setTimeout(() => {
  syncReferralRecords();
}, 3000);