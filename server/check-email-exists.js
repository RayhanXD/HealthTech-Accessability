require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');
const Trainer = require('./models/Trainer');

/**
 * Utility script to check if an email exists in either Player or Trainer collection
 * Usage: node check-email-exists.js <email>
 */

async function checkEmailExists(email) {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    if (!email) {
      console.error('❌ Error: Please provide an email address');
      console.log('Usage: node check-email-exists.js <email>');
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Checking for email: ${normalizedEmail}\n`);

    // Check in Player collection
    const player = await Player.findOne({ Email: normalizedEmail });
    if (player) {
      console.log('✅ Found in Player collection:');
      console.log(`   ID: ${player._id}`);
      console.log(`   Name: ${player.fName} ${player.Lname}`);
      console.log(`   Email: ${player.Email}`);
      console.log(`   Created: ${player.createdAt}\n`);
    } else {
      console.log('❌ Not found in Player collection\n');
    }

    // Check in Trainer collection
    const trainer = await Trainer.findOne({ Email: normalizedEmail });
    if (trainer) {
      console.log('✅ Found in Trainer collection:');
      console.log(`   ID: ${trainer._id}`);
      console.log(`   Name: ${trainer.fName} ${trainer.lname}`);
      console.log(`   Email: ${trainer.Email}`);
      console.log(`   Created: ${trainer.createdAt}\n`);
    } else {
      console.log('❌ Not found in Trainer collection\n');
    }

    // Check database indexes
    console.log('📊 Checking database indexes...');
    const playerIndexes = await Player.collection.getIndexes();
    const trainerIndexes = await Trainer.collection.getIndexes();
    
    console.log('\nPlayer Email indexes:');
    console.log(JSON.stringify(playerIndexes, null, 2));
    console.log('\nTrainer Email indexes:');
    console.log(JSON.stringify(trainerIndexes, null, 2));

    if (!player && !trainer) {
      console.log('\n💡 Email is available for registration!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n👋 MongoDB connection closed');
    }
  }
}

const email = process.argv[2];
checkEmailExists(email);

