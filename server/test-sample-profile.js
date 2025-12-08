require('dotenv').config();
const axios = require('axios');

/**
 * Test script to fetch data from Sahha sample profiles
 * 
 * Usage:
 *   node test-sample-profile.js <sampleProfileId>
 * 
 * Or set SAHHA_SAMPLE_PROFILE_ID in .env
 * 
 * Example:
 *   node test-sample-profile.js SampleProfile-5a6c7159-139f-4c5f-a578-03cb579b...
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const SAMPLE_PROFILE_ID = process.argv[2] || process.env.SAHHA_SAMPLE_PROFILE_ID;

if (!SAMPLE_PROFILE_ID) {
  console.error('❌ Error: Sample profile ID is required');
  console.log('\nUsage:');
  console.log('  node test-sample-profile.js <sampleProfileId>');
  console.log('\nOr set SAHHA_SAMPLE_PROFILE_ID in your .env file');
  console.log('\nExample:');
  console.log('  node test-sample-profile.js SampleProfile-5a6c7159-139f-4c5f-a578-03cb579b...');
  process.exit(1);
}

async function testSampleProfile() {
  console.log('🧪 Testing Sahha Sample Profile Data Fetch\n');
  console.log('='.repeat(60));
  console.log(`📋 Sample Profile ID: ${SAMPLE_PROFILE_ID}`);
  console.log(`🌐 Server URL: ${SERVER_URL}\n`);

  try {
    // Test 1: Get Health Scores
    console.log('1️⃣ Testing Health Scores Endpoint...');
    console.log(`   GET ${SERVER_URL}/api/sahha/scores/${SAMPLE_PROFILE_ID}\n`);
    
    try {
      const scoresResponse = await axios.get(
        `${SERVER_URL}/api/sahha/scores/${SAMPLE_PROFILE_ID}`
      );

      if (scoresResponse.data.success) {
        console.log('   ✅ Success! Health scores retrieved');
        console.log('   📊 Data structure:');
        console.log(JSON.stringify(scoresResponse.data.data, null, 2));
      } else {
        console.log('   ⚠️  Response indicates failure:');
        console.log(JSON.stringify(scoresResponse.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Error fetching health scores:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.message}`);
        if (error.response.status === 404) {
          console.log('   💡 Note: 404 might mean:');
          console.log('      - Sample profiles may not support scores endpoint');
          console.log('      - Profile ID format might need adjustment');
          console.log('      - Endpoint path might be different for sample profiles');
        } else if (error.response.status === 204) {
          console.log('   ℹ️  204 No Content - No scores available (this is normal)');
        }
        if (error.response.data) {
          console.log('   Response:', JSON.stringify(error.response.data, null, 2));
        }
      } else {
        console.log(`   ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
          console.log('   💡 Make sure your server is running!');
        }
      }
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // Test 2: Sync Insights
    console.log('2️⃣ Testing Insights Sync Endpoint...');
    console.log(`   POST ${SERVER_URL}/api/sahha/sync/${SAMPLE_PROFILE_ID}\n`);
    
    try {
      const insightsResponse = await axios.post(
        `${SERVER_URL}/api/sahha/sync/${SAMPLE_PROFILE_ID}`
      );

      if (insightsResponse.data.success) {
        console.log('   ✅ Success! Insights synced');
        const insights = insightsResponse.data.data?.Insights || {};
        console.log(`   📈 Trends: ${insights.Trends?.length || 0} items`);
        console.log(`   📊 Comparisons: ${insights.Comparisons?.length || 0} items`);
        
        if (insights.Trends && insights.Trends.length > 0) {
          console.log('\n   📈 Sample Trend Data:');
          console.log(JSON.stringify(insights.Trends[0], null, 2));
        }
        
        if (insights.Comparisons && insights.Comparisons.length > 0) {
          console.log('\n   📊 Sample Comparison Data:');
          console.log(JSON.stringify(insights.Comparisons[0], null, 2));
        }
        
        if (insights.Trends?.length === 0 && insights.Comparisons?.length === 0) {
          console.log('\n   ⚠️  No insights data available');
          console.log('   💡 This could mean:');
          console.log('      - Sample profile needs time to generate insights');
          console.log('      - Sample profile may not have enough data yet');
          console.log('      - The endpoint is working, but data needs to be collected first');
        }
      } else {
        console.log('   ⚠️  Response indicates failure:');
        console.log(JSON.stringify(insightsResponse.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Error syncing insights:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.message}`);
        console.log('   Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log(`   ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure your server is running on', SERVER_URL);
    }
    process.exit(1);
  }
}

// Run the test
testSampleProfile();
