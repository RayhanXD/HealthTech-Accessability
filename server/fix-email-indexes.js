require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');
const Trainer = require('./models/Trainer');

/**
 * Utility script to fix email index issues in the database
 * This will:
 * 1. Check for duplicate emails
 * 2. Rebuild indexes if needed
 * 3. Clean up any invalid entries
 */

async function fixEmailIndexes() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    console.log('🔍 Checking for duplicate emails...\n');

    // Check for duplicate emails in Player collection
    const playerDuplicates = await Player.aggregate([
      {
        $group: {
          _id: { $toLower: '$Email' },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (playerDuplicates.length > 0) {
      console.log('⚠️  Found duplicate emails in Player collection:');
      playerDuplicates.forEach(dup => {
        console.log(`   Email: ${dup._id}, Count: ${dup.count}, IDs: ${dup.ids}`);
      });
      console.log('');
    } else {
      console.log('✅ No duplicate emails found in Player collection\n');
    }

    // Check for duplicate emails in Trainer collection
    const trainerDuplicates = await Trainer.aggregate([
      {
        $group: {
          _id: { $toLower: '$Email' },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (trainerDuplicates.length > 0) {
      console.log('⚠️  Found duplicate emails in Trainer collection:');
      trainerDuplicates.forEach(dup => {
        console.log(`   Email: ${dup._id}, Count: ${dup.count}, IDs: ${dup.ids}`);
      });
      console.log('');
    } else {
      console.log('✅ No duplicate emails found in Trainer collection\n');
    }

    // Check for players with invalid emails (null, undefined, empty)
    const invalidPlayers = await Player.find({
      $or: [
        { Email: null },
        { Email: undefined },
        { Email: '' },
        { Email: { $exists: false } }
      ]
    });

    if (invalidPlayers.length > 0) {
      console.log(`⚠️  Found ${invalidPlayers.length} players with invalid emails:`);
      invalidPlayers.forEach(player => {
        console.log(`   ID: ${player._id}, Name: ${player.fName} ${player.Lname}, Email: ${player.Email}`);
      });
      console.log('');
    } else {
      console.log('✅ All players have valid emails\n');
    }

    // Check for trainers with invalid emails
    const invalidTrainers = await Trainer.find({
      $or: [
        { Email: null },
        { Email: undefined },
        { Email: '' },
        { Email: { $exists: false } }
      ]
    });

    if (invalidTrainers.length > 0) {
      console.log(`⚠️  Found ${invalidTrainers.length} trainers with invalid emails:`);
      invalidTrainers.forEach(trainer => {
        console.log(`   ID: ${trainer._id}, Name: ${trainer.fName} ${trainer.lname}, Email: ${trainer.Email}`);
      });
      console.log('');
    } else {
      console.log('✅ All trainers have valid emails\n');
    }

    // Rebuild indexes
    console.log('🔧 Rebuilding indexes...');
    try {
      await Player.collection.dropIndex('Email_1').catch(() => {});
      await Trainer.collection.dropIndex('Email_1').catch(() => {});
      console.log('   Dropped existing Email indexes');
      
      // Recreate indexes
      await Player.collection.createIndex({ Email: 1 }, { unique: true });
      await Trainer.collection.createIndex({ Email: 1 }, { unique: true });
      console.log('   ✅ Recreated Email indexes\n');
    } catch (error) {
      console.log(`   ⚠️  Index rebuild warning: ${error.message}\n`);
    }

    // Check for emails that exist in both collections
    console.log('🔍 Checking for emails that exist in both Player and Trainer collections...');
    const allPlayerEmails = await Player.find({}, { Email: 1 }).lean();
    const allTrainerEmails = await Trainer.find({}, { Email: 1 }).lean();
    
    const playerEmailSet = new Set(allPlayerEmails.map(p => p.Email?.toLowerCase()).filter(Boolean));
    const trainerEmailSet = new Set(allTrainerEmails.map(t => t.Email?.toLowerCase()).filter(Boolean));
    
    const crossCollectionDuplicates = [...playerEmailSet].filter(email => trainerEmailSet.has(email));
    
    if (crossCollectionDuplicates.length > 0) {
      console.log('⚠️  Found emails that exist in both collections:');
      crossCollectionDuplicates.forEach(email => {
        console.log(`   ${email}`);
      });
      console.log('');
    } else {
      console.log('✅ No cross-collection email conflicts\n');
    }

    console.log('✅ Index check and fix completed!\n');
    console.log('💡 If you still have issues, try:');
    console.log('   1. Check specific email: node check-email-exists.js <email>');
    console.log('   2. Delete player by email: node delete-player-by-email.js <email>');
    console.log('   3. List all players: node list-all-players.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed');
    }
  }
}

// Run the function
fixEmailIndexes();
