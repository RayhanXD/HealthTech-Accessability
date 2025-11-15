require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');
const sahhaService = require('./services/sahhaService');

async function testSahhaIntegration() {
  console.log('🧪 Starting Sahha API Integration Test\n');

  try {
    // 1. Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 2. Test Sahha Authentication
    console.log('2️⃣ Testing Sahha Authentication...');
    try {
      const token = await sahhaService.getAccountToken();
      console.log('✅ Authentication successful!');
      console.log(`   Token: ${token.substring(0, 20)}...\n`);
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      throw error;
    }

    // 3. Create a test player
    console.log('3️⃣ Creating test player...');
    const testPlayer = new Player({
      Username: `test_player_${Date.now()}`,
      Password: 'test123456',
      fName: 'Test',
      Lname: 'Player',
      Age: 25,
      Bodyweight_in_pounds: 165,
      Height_in_inches: 70,
      SexAtBirth: 'Male'
    });
    await testPlayer.save();
    console.log(`✅ Test player created: ${testPlayer._id}\n`);

    // 4. Create Sahha Profile
    console.log('4️⃣ Creating Sahha profile...');
    try {
      const sahhaProfile = await sahhaService.createProfile({
        externalId: testPlayer._id.toString(),
        Age: testPlayer.Age,
        Bodyweight_in_pounds: testPlayer.Bodyweight_in_pounds,
        Height_in_inches: testPlayer.Height_in_inches,
        SexAtBirth: testPlayer.SexAtBirth
      });
      
      const profileId = sahhaProfile.id || sahhaProfile.profile_id;
      testPlayer.sahhaProfileId = profileId;
      testPlayer.sahhaProfileToken = sahhaProfile.token || sahhaProfile.profile_token;
      await testPlayer.save();
      
      console.log(`✅ Sahha profile created: ${profileId}\n`);
    } catch (error) {
      console.error('❌ Failed to create Sahha profile:', error.message);
      throw error;
    }

    // 5. Test fetching insights (may be empty initially)
    console.log('5️⃣ Testing insights fetch...');
    try {
      const insights = await sahhaService.syncInsights(testPlayer.sahhaProfileId);
      console.log('✅ Insights fetched successfully');
      console.log(`   Trends: ${insights.Trends?.length || 0} items`);
      console.log(`   Comparisons: ${insights.Comparisons?.length || 0} items\n`);
    } catch (error) {
      console.error('⚠️ Insights fetch failed (may be normal if no data yet):', error.message);
    }

    // 6. Test health scores
    console.log('6️⃣ Testing health scores...');
    try {
      const axios = require('axios');
      const token = await sahhaService.getAccountToken();
      const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
      
      const response = await axios.get(
        `${dataBaseURL}/api/v1/profiles/${testPlayer.sahhaProfileId}/scores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Health scores fetched:');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('⚠️ Health scores fetch failed (may be normal if no data yet):', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n✅ All tests completed!');
    console.log(`\n📝 Test Player ID: ${testPlayer._id}`);
    console.log(`📝 Sahha Profile ID: ${testPlayer.sahhaProfileId}`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Register webhook URL in Sahha Dashboard: ${process.env.WEBHOOK_URL || 'http://your-server.com/api/sahha/webhook'}`);
    console.log(`   2. Use Sahha Demo App or SDK to sync data for this profile`);
    console.log(`   3. Wait 24-48 hours for initial data collection`);
    console.log(`   4. Test webhook endpoint when data arrives`);
    console.log(`\n🗑️  To delete test player, run:`);
    console.log(`   await Player.findByIdAndDelete('${testPlayer._id}')`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run the test
testSahhaIntegration();




