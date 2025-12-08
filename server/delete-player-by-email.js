require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');

/**
 * Utility script to delete a player by email address
 * Usage: node delete-player-by-email.js <email>
 * Example: node delete-player-by-email.js test@example.com
 */

async function deletePlayerByEmail(email) {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    if (!email) {
      console.error('❌ Error: Please provide an email address');
      console.log('Usage: node delete-player-by-email.js <email>');
      console.log('Example: node delete-player-by-email.js test@example.com\n');
      process.exit(1);
    }

    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();

    // Find player by email
    console.log(`🔍 Searching for player with email: ${normalizedEmail}...`);
    const player = await Player.findOne({ Email: normalizedEmail });

    if (!player) {
      console.log(`❌ No player found with email: ${normalizedEmail}\n`);
      console.log('💡 This email is available for registration.\n');
      process.exit(0);
    }

    // Display player info
    console.log('📋 Found player:');
    console.log(`   ID: ${player._id}`);
    console.log(`   Name: ${player.fName} ${player.Lname}`);
    console.log(`   Email: ${player.Email}`);
    console.log(`   Username: ${player.Username || 'N/A'}`);
    console.log(`   Created: ${player.createdAt}`);
    console.log('');

    // Delete the player
    console.log('🗑️  Deleting player...');
    await Player.findByIdAndDelete(player._id);
    console.log('✅ Player deleted successfully!\n');
    console.log(`💡 You can now register with email: ${normalizedEmail}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'CastError') {
      console.error('   Invalid email format');
    }
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed');
    }
  }
}

// Get email from command line arguments
const email = process.argv[2];

// Run the function
deletePlayerByEmail(email);
