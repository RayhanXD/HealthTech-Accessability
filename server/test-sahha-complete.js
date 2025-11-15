require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Player = require('./models/Player');
const sahhaService = require('./services/sahhaService');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const SAHHA_DATA_BASE_URL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';

async function testSahhaComplete() {
  console.log('🧪 Complete Sahha API Testing Suite\n');
  console.log('=' .repeat(60) + '\n');

  let testPlayer = null;

  try {
    // 1. Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // 2. Test Sahha Authentication (with our fixes)
    console.log('2️⃣ Testing Sahha Authentication...');
    console.log('   (Testing the fixed authentication method)\n');
    try {
      const token = await sahhaService.getAccountToken();
      console.log('✅ Authentication successful!');
      console.log(`   Token: ${token.substring(0, 30)}...`);
      console.log(`   Token length: ${token.length} characters\n`);
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check SAHHA_CLIENT_ID and SAHHA_CLIENT_SECRET in .env');
      console.error('   - Verify SAHHA_ENVIRONMENT matches your credentials');
      console.error('   - Ensure credentials are activated in Sahha Dashboard\n');
      throw error;
    }

    // 3. Create a test player
    console.log('3️⃣ Creating test player in database...');
    testPlayer = new Player({
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
    console.log(`✅ Test player created`);
    console.log(`   Player ID: ${testPlayer._id}\n`);

    // 4. Test Profile Creation via Backend API
    console.log('4️⃣ Testing Sahha Profile Creation (via API endpoint)...');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/sahha/sync`, {
        playerId: testPlayer._id.toString(),
        Age: testPlayer.Age,
        Bodyweight_in_pounds: testPlayer.Bodyweight_in_pounds,
        Height_in_inches: testPlayer.Height_in_inches,
        SexAtBirth: testPlayer.SexAtBirth
      });

      if (response.data.success) {
        console.log('✅ Profile created via API endpoint');
        console.log(`   Sahha Profile ID: ${response.data.data.sahhaProfileId}`);
        console.log(`   Profile Token: ${response.data.data.sahhaProfileToken?.substring(0, 30)}...`);
        
        // Refresh player from DB
        testPlayer = await Player.findById(testPlayer._id);
        console.log(`   ✅ Player record updated in database\n`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('❌ Profile creation failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }

    // 5. Test Token Retrieval Endpoint (NEW)
    console.log('5️⃣ Testing Profile Token Retrieval (NEW endpoint)...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sahha/token/${testPlayer._id}`);
      
      if (response.data.success && response.data.token) {
        console.log('✅ Token retrieval successful');
        console.log(`   Profile Token: ${response.data.token.substring(0, 30)}...`);
        console.log(`   Profile ID: ${response.data.sahhaProfileId}\n`);
      } else {
        throw new Error('No token in response');
      }
    } catch (error) {
      console.error('❌ Token retrieval failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }

    // 6. Test Insights Fetch
    console.log('6️⃣ Testing Insights Fetch...');
    try {
      const insights = await sahhaService.syncInsights(testPlayer.sahhaProfileId);
      console.log('✅ Insights fetched successfully');
      console.log(`   Trends: ${insights.Trends?.length || 0} items`);
      console.log(`   Comparisons: ${insights.Comparisons?.length || 0} items`);
      
      if (insights.Trends?.length === 0 && insights.Comparisons?.length === 0) {
        console.log('   ⚠️  No insights yet (normal for new profiles)');
        console.log('   💡 Insights will appear after data is collected via SDK\n');
      } else {
        console.log('   📊 Sample data available!\n');
      }
    } catch (error) {
      console.error('⚠️  Insights fetch failed (may be normal if no data yet):', error.message);
      console.log('');
    }

    // 7. Test Health Scores
    console.log('7️⃣ Testing Health Scores Fetch...');
    try {
      const accountToken = await sahhaService.getAccountToken();
      const response = await axios.get(
        `${SAHHA_DATA_BASE_URL}/api/v1/profile/score/${testPlayer.sahhaProfileId}`,
        {
          headers: {
            'Authorization': `account ${accountToken}`
          }
        }
      );
      console.log('✅ Health scores fetched:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');
    } catch (error) {
      console.error('⚠️  Health scores fetch failed (may be normal if no data yet):', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        if (error.response.status === 204) {
          console.error('   ℹ️  204 No Content - No scores available yet (normal)\n');
        } else {
          console.error('   Response:', JSON.stringify(error.response.data, null, 2));
        }
      }
      console.log('');
    }

    // 8. Test Profile Info
    console.log('8️⃣ Testing Profile Information Fetch...');
    try {
      const accountToken = await sahhaService.getAccountToken();
      const response = await axios.get(
        `${SAHHA_DATA_BASE_URL}/api/v1/account/profile/${testPlayer._id}`,
        {
          headers: {
            'Authorization': `account ${accountToken}`
          }
        }
      );
      console.log('✅ Profile info fetched:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('');
    } catch (error) {
      console.error('⚠️  Profile info fetch failed:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
      console.log('');
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('✅ ALL TESTS COMPLETED!\n');
    console.log('📝 Test Results Summary:');
    console.log(`   ✅ Authentication: Working`);
    console.log(`   ✅ Profile Creation: Working`);
    console.log(`   ✅ Token Retrieval: Working`);
    console.log(`   ✅ API Endpoints: Working\n`);
    console.log('📝 Test Data:');
    console.log(`   Player ID: ${testPlayer._id}`);
    console.log(`   Sahha Profile ID: ${testPlayer.sahhaProfileId}`);
    console.log(`   Profile Token: ${testPlayer.sahhaProfileToken?.substring(0, 30)}...\n`);
    console.log('💡 Next Steps:');
    console.log('   1. Use this playerId in your client app to test SDK');
    console.log('   2. Store playerId in AsyncStorage:');
    console.log(`      await AsyncStorage.setItem('playerId', '${testPlayer._id}')`);
    console.log('   3. Test SDK initialization on a physical device');
    console.log('   4. Grant health permissions when prompted');
    console.log('   5. Wait for data collection (24-48 hours) or use Sahha Demo App\n');
    console.log('🗑️  To clean up test data:');
    console.log(`   await Player.findByIdAndDelete('${testPlayer._id}')`);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST SUITE FAILED\n');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('\nResponse Details:');
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('\n💡 Check:');
    console.error('   1. Server is running on', API_BASE_URL);
    console.error('   2. MongoDB connection is working');
    console.error('   3. Sahha credentials are correct in .env');
    console.error('   4. Network connectivity');
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n👋 MongoDB connection closed');
    }
  }
}

// Run the test
testSahhaComplete();

