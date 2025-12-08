require('dotenv').config();
const axios = require('axios');
const sahhaService = require('./services/sahhaService');

const EXTERNAL_ID = 'SampleProfile-5a6c7159-139f-4c5f-a578-03cb579bd56c';
const ACTUAL_PROFILE_ID = '919a94ea-c5e1-4b10-ad4e-377be8c3e3e0';

async function testInsightEndpoints() {
  console.log('🔍 Testing Correct Insight Endpoints\n');
  console.log('='.repeat(60));
  
  const token = await sahhaService.getAccountToken();
  const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
  
  // Test the correct endpoint format from docs: /api/v1/profile/insight/trend
  console.log('1️⃣ Testing Trends Endpoint (/api/v1/profile/insight/trend)\n');
  
  const trendVariations = [
    {
      name: 'With profileId query param',
      url: `${dataBaseURL}/api/v1/profile/insight/trend?profileId=${ACTUAL_PROFILE_ID}`
    },
    {
      name: 'With profileId and date range',
      url: `${dataBaseURL}/api/v1/profile/insight/trend?profileId=${ACTUAL_PROFILE_ID}&startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z`
    },
    {
      name: 'With external ID as profileId',
      url: `${dataBaseURL}/api/v1/profile/insight/trend?profileId=${EXTERNAL_ID}`
    },
    {
      name: 'With profileId in path (alternative)',
      url: `${dataBaseURL}/api/v1/profile/insight/trend/${ACTUAL_PROFILE_ID}`
    },
  ];
  
  for (const variation of trendVariations) {
    try {
      console.log(`   Testing: ${variation.name}`);
      const response = await axios.get(variation.url, {
        headers: {
          'Authorization': `account ${token}`
        },
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        const data = response.data?.data || response.data || [];
        const count = Array.isArray(data) ? data.length : (data ? 'object' : 0);
        console.log(`   ✅ SUCCESS! Status 200, Found: ${count}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0], null, 2)}`);
        } else if (data && typeof data === 'object') {
          console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
        }
        break; // Found working format
      } else {
        console.log(`   ❌ Status ${response.status}`);
        if (response.data) {
          console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log('');
  }
  
  console.log('\n2️⃣ Testing Comparisons Endpoint (/api/v1/profile/insight/comparison)\n');
  
  const comparisonVariations = [
    {
      name: 'With profileId query param',
      url: `${dataBaseURL}/api/v1/profile/insight/comparison?profileId=${ACTUAL_PROFILE_ID}`
    },
    {
      name: 'With profileId and date range',
      url: `${dataBaseURL}/api/v1/profile/insight/comparison?profileId=${ACTUAL_PROFILE_ID}&startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z`
    },
    {
      name: 'With profileId in path (like trends)',
      url: `${dataBaseURL}/api/v1/profile/insight/comparison/${ACTUAL_PROFILE_ID}`
    },
    {
      name: 'With profileId in path and query params',
      url: `${dataBaseURL}/api/v1/profile/insight/comparison/${ACTUAL_PROFILE_ID}?startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z`
    },
  ];
  
  for (const variation of comparisonVariations) {
    try {
      console.log(`   Testing: ${variation.name}`);
      const response = await axios.get(variation.url, {
        headers: {
          'Authorization': `account ${token}`
        },
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        const data = response.data?.data || response.data || [];
        const count = Array.isArray(data) ? data.length : (data ? 'object' : 0);
        console.log(`   ✅ SUCCESS! Status 200, Found: ${count}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0], null, 2)}`);
        } else if (data && typeof data === 'object') {
          console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
        }
        break; // Found working format
      } else {
        console.log(`   ❌ Status ${response.status}`);
        if (response.data) {
          console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
  console.log('✅ Test completed!\n');
}

testInsightEndpoints();
