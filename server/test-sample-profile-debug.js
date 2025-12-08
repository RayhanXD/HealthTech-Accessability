require('dotenv').config();
const axios = require('axios');
const sahhaService = require('./services/sahhaService');

const EXTERNAL_ID = 'SampleProfile-5a6c7159-139f-4c5f-a578-03cb579bd56c';
const ACTUAL_PROFILE_ID = '919a94ea-c5e1-4b10-ad4e-377be8c3e3e0';

async function debugEndpoints() {
  console.log('🔍 Debugging Sahha API Endpoints\n');
  console.log('='.repeat(60));
  
  const token = await sahhaService.getAccountToken();
  const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';
  
  // Test ALL possible endpoint variations
  const endpoints = [
    // Trends variations
    { name: 'Trends - profiles plural', path: `/api/v1/profiles/${ACTUAL_PROFILE_ID}/trends` },
    { name: 'Trends - profile singular', path: `/api/v1/profile/${ACTUAL_PROFILE_ID}/trends` },
    { name: 'Trends - with external ID', path: `/api/v1/profiles/${EXTERNAL_ID}/trends` },
    { name: 'Trends - account profile', path: `/api/v1/account/profile/${ACTUAL_PROFILE_ID}/trends` },
    { name: 'Trends - account profiles', path: `/api/v1/account/profiles/${ACTUAL_PROFILE_ID}/trends` },
    
    // Comparisons variations
    { name: 'Comparisons - profiles plural', path: `/api/v1/profiles/${ACTUAL_PROFILE_ID}/comparisons` },
    { name: 'Comparisons - profile singular', path: `/api/v1/profile/${ACTUAL_PROFILE_ID}/comparisons` },
    { name: 'Comparisons - with external ID', path: `/api/v1/profiles/${EXTERNAL_ID}/comparisons` },
    { name: 'Comparisons - account profile', path: `/api/v1/account/profile/${ACTUAL_PROFILE_ID}/comparisons` },
    
    // Insights variations (maybe it's called insights?)
    { name: 'Insights - profiles', path: `/api/v1/profiles/${ACTUAL_PROFILE_ID}/insights` },
    { name: 'Insights - profile', path: `/api/v1/profile/${ACTUAL_PROFILE_ID}/insights` },
    { name: 'Insights - account', path: `/api/v1/account/profile/${ACTUAL_PROFILE_ID}/insights` },
    
    // Maybe it needs query params?
    { name: 'Trends - with start_date', path: `/api/v1/profiles/${ACTUAL_PROFILE_ID}/trends?start_date=2025-11-01&end_date=2025-12-08` },
    { name: 'Trends - with startDateTime', path: `/api/v1/profiles/${ACTUAL_PROFILE_ID}/trends?startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z` },
  ];
  
  console.log('Testing Trends/Comparisons/Insights Endpoints:\n');
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(
        `${dataBaseURL}${endpoint.path}`,
        {
          headers: {
            'Authorization': `account ${token}`
          },
          validateStatus: () => true
        }
      );
      
      if (response.status === 200) {
        const data = response.data?.data || response.data || [];
        const count = Array.isArray(data) ? data.length : (data ? 'object' : 0);
        console.log(`   ✅ ${endpoint.name}: Status 200, Data: ${count}`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`      First item keys: ${Object.keys(data[0]).join(', ')}`);
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log(`      Object keys: ${Object.keys(data).join(', ')}`);
        }
      } else if (response.status === 204) {
        console.log(`   ⚠️  ${endpoint.name}: Status 204 (No Content)`);
      } else {
        console.log(`   ❌ ${endpoint.name}: Status ${response.status}`);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || error.message}`);
      }
    }
  }
  
  // Also test if we can get insights from the profile info endpoint
  console.log('\n\nTesting Profile Info Endpoint for Insights:\n');
  try {
    const profileInfo = await axios.get(
      `${dataBaseURL}/api/v1/account/profile/${EXTERNAL_ID}`,
      {
        headers: {
          'Authorization': `account ${token}`
        }
      }
    );
    
    console.log('   Profile Info Keys:', Object.keys(profileInfo.data).join(', '));
    console.log('   Full Profile Info:');
    console.log(JSON.stringify(profileInfo.data, null, 2));
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test scores endpoint more thoroughly
  console.log('\n\nTesting Scores Endpoint Variations:\n');
  const scoreEndpoints = [
    { name: 'Score - actual ID, today', path: `/api/v1/profile/score/${ACTUAL_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=2025-12-08T00:00:00Z&endDateTime=2025-12-08T23:59:59Z` },
    { name: 'Score - actual ID, last week', path: `/api/v1/profile/score/${ACTUAL_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=2025-12-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z` },
    { name: 'Score - actual ID, Nov-Dec', path: `/api/v1/profile/score/${ACTUAL_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z` },
    { name: 'Score - external ID', path: `/api/v1/profile/score/${EXTERNAL_ID}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=2025-11-01T00:00:00Z&endDateTime=2025-12-08T23:59:59Z` },
  ];
  
  for (const endpoint of scoreEndpoints) {
    try {
      const response = await axios.get(
        `${dataBaseURL}${endpoint.path}`,
        {
          headers: {
            'Authorization': `account ${token}`
          },
          validateStatus: () => true
        }
      );
      
      if (response.status === 200) {
        const scores = response.data?.data || response.data || [];
        const count = Array.isArray(scores) ? scores.length : (scores ? 'object' : 0);
        console.log(`   ✅ ${endpoint.name}: Status 200, Scores: ${count}`);
        if (Array.isArray(scores) && scores.length > 0) {
          scores.forEach(score => {
            console.log(`      - ${score.type}: ${score.score} (${score.state})`);
          });
        }
      } else {
        console.log(`   ❌ ${endpoint.name}: Status ${response.status}`);
        if (response.data) {
          console.log(`      Response: ${JSON.stringify(response.data, null, 2)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Debug completed!\n');
}

debugEndpoints();
