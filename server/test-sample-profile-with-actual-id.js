require('dotenv').config();
const axios = require('axios');
const sahhaService = require('./services/sahhaService');

/**
 * Test with actual profile ID and correct date ranges
 * Based on dashboard data showing Nov 3 - Dec 7, 2025
 */

const EXTERNAL_ID = process.argv[2] || 'SampleProfile-5a6c7159-139f-4c5f-a578-03cb579bd56c';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

async function testWithActualProfileId() {
  console.log('🧪 Testing with Actual Profile ID Resolution\n');
  console.log('='.repeat(60));
  console.log(`📋 External ID: ${EXTERNAL_ID}\n`);

  try {
    // Step 1: Get actual profile ID
    console.log('1️⃣ Getting actual profile ID from external ID...');
    const token = await sahhaService.getAccountToken();
    const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
    
    const profileInfo = await axios.get(
      `${dataBaseURL}/api/v1/account/profile/${EXTERNAL_ID}`,
      {
        headers: {
          'Authorization': `account ${token}`
        }
      }
    );
    
    const actualProfileId = profileInfo.data.profileId;
    const dataLastReceived = profileInfo.data.dataLastReceivedAtUtc;
    
    console.log(`   ✅ Actual Profile ID: ${actualProfileId}`);
    console.log(`   📅 Data last received: ${dataLastReceived}\n`);

    // Step 2: Test scores with date range that includes the data
    // Dashboard shows data from Nov 3 - Dec 7, 2025
    console.log('2️⃣ Testing Health Scores with actual profile ID...');
    
    const dateRanges = [
      { name: 'Last 30 days', start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() },
      { name: 'Nov 1 - Dec 8, 2025', start: '2025-11-01T00:00:00Z', end: '2025-12-08T23:59:59Z' },
      { name: 'Dec 1 - Dec 8, 2025', start: '2025-12-01T00:00:00Z', end: '2025-12-08T23:59:59Z' },
      { name: 'Dec 7, 2025 (dashboard date)', start: '2025-12-07T00:00:00Z', end: '2025-12-08T00:00:00Z' },
    ];
    
    for (const range of dateRanges) {
      try {
        const url = `${dataBaseURL}/api/v1/profile/score/${actualProfileId}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=${range.start}&endDateTime=${range.end}`;
        
        const response = await axios.get(url, {
          headers: {
            'Authorization': `account ${token}`
          }
        });
        
        const scores = response.data?.data || response.data || [];
        console.log(`   ${range.name}: ${Array.isArray(scores) ? scores.length : 'N/A'} score(s)`);
        
        if (Array.isArray(scores) && scores.length > 0) {
          console.log('   ✅ Found scores!');
          scores.forEach(score => {
            console.log(`      - ${score.type}: ${score.score} (${score.state})`);
          });
          break; // Found data, stop testing other ranges
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.log(`   ${range.name}: Error ${error.response?.status || error.message}`);
        }
      }
    }

    console.log('\n3️⃣ Testing Trends with actual profile ID...');
    
    // Test trends with actual profile ID
    try {
      const trends = await sahhaService.getTrends(actualProfileId, {
        startDate: '2025-11-01',
        endDate: '2025-12-08'
      });
      
      const trendsData = trends?.data || trends || [];
      console.log(`   ✅ Found ${Array.isArray(trendsData) ? trendsData.length : 'N/A'} trend(s)`);
      
      if (Array.isArray(trendsData) && trendsData.length > 0) {
        console.log('   Sample trend:');
        console.log(JSON.stringify(trendsData[0], null, 2));
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n4️⃣ Testing Comparisons with actual profile ID...');
    
    // Test comparisons with actual profile ID
    try {
      const comparisons = await sahhaService.getComparisons(actualProfileId, {
        startDate: '2025-11-01',
        endDate: '2025-12-08'
      });
      
      const comparisonsData = comparisons?.data || comparisons || [];
      console.log(`   ✅ Found ${Array.isArray(comparisonsData) ? comparisonsData.length : 'N/A'} comparison(s)`);
      
      if (Array.isArray(comparisonsData) && comparisonsData.length > 0) {
        console.log('   Sample comparison:');
        console.log(JSON.stringify(comparisonsData[0], null, 2));
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n5️⃣ Testing via Backend API (should auto-resolve profile ID)...');
    
    // Test via our backend - it should now auto-resolve
    try {
      const syncResponse = await axios.post(
        `${SERVER_URL}/api/sahha/sync/${EXTERNAL_ID}`
      );
      
      if (syncResponse.data.success) {
        const insights = syncResponse.data.data?.Insights || {};
        console.log(`   ✅ Backend sync successful!`);
        console.log(`   📈 Trends: ${insights.Trends?.length || 0} items`);
        console.log(`   📊 Comparisons: ${insights.Comparisons?.length || 0} items`);
        
        if (insights.Trends && insights.Trends.length > 0) {
          console.log('   Sample trend:');
          console.log(JSON.stringify(insights.Trends[0], null, 2));
        }
      }
    } catch (error) {
      console.log(`   ❌ Backend error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testWithActualProfileId();
