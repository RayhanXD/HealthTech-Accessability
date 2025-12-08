require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');

/**
 * Utility script to list all players in the database
 * Usage: node list-all-players.js
 */

async function listAllPlayers() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find all players
    console.log('🔍 Fetching all players...\n');
    const players = await Player.find({}).select('-Password').sort({ createdAt: -1 });

    if (players.length === 0) {
      console.log('📭 No players found in the database.\n');
      process.exit(0);
    }

    console.log(`📊 Found ${players.length} player(s):\n`);
    console.log('='.repeat(80));

    players.forEach((player, index) => {
      console.log(`\n${index + 1}. Player Details:`);
      console.log(`   ID: ${player._id}`);
      console.log(`   Name: ${player.fName} ${player.Lname}`);
      console.log(`   Email: ${player.Email}`);
      console.log(`   Username: ${player.Username || 'N/A'}`);
      console.log(`   Age: ${player.Age || 'N/A'}`);
      console.log(`   Created: ${player.createdAt}`);
      if (player.sahhaProfileId) {
        console.log(`   Sahha Profile ID: ${player.sahhaProfileId}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n💡 To delete a player by email, run:`);
    console.log(`   node delete-player-by-email.js <email>\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed');
    }
  }
}

// Run the function
listAllPlayers();
