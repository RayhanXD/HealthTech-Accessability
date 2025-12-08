require('dotenv').config();
const sahhaService = require('./services/sahhaService');
const axios = require('axios');

/**
 * Test script to directly query Sahha API with sample profile
 * This bypasses our backend to test the raw Sahha API
 */

const SAMPLE_PROFILE_ID = process.argv[2] || process.env.SAHHA_SAMPLE_PROFILE_ID;

if (!SAMPLE_PROFILE_ID) {
  console.error('❌ Error: Sample profile ID is required');
  console.log('\nUsage:');
  console.log('  node test-sample-profile-direct.js <sampleProfileId>');
  process.exit(1);
}

async function testDirectSahhaAPI() {
  console.log('🧪 Testing Sahha API Directly (Bypassing Backend)\n');
  console.log('='.repeat(60));
  console.log(`📋 Sample Profile ID: ${SAMPLE_PROFILE_ID}\n`);

  try {
    // Get account token
    console.log('1️⃣ Getting account token...');
    const token = await sahhaService.getAccountToken();
    console.log('   ✅ Token obtained\n');

    const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();
    
    // Test different endpoint variations with correct query parameters
    const endpoints = [
      { 
        name: 'Correct format with query params (profile ID in path)', 
        path: `/api/v1/profile/score/${SAMPLE_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${startDateTime}&endDateTime=${endDateTime}` 
      },
      { 
        name: 'Correct format with query params (profile ID as query param)', 
        path: `/api/v1/profile/score?profileId=${SAMPLE_PROFILE_ID}&types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${startDateTime}&endDateTime=${endDateTime}` 
      },
      { 
        name: 'Correct format with query params (external ID as query param)', 
        path: `/api/v1/profile/score?externalId=${encodeURIComponent(SAMPLE_PROFILE_ID)}&types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${startDateTime}&endDateTime=${endDateTime}` 
      },
      { 
        name: 'All score types', 
        path: `/api/v1/profile/score/${SAMPLE_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing,sleep&startDateTime=${startDateTime}&endDateTime=${endDateTime}` 
      },
    ];

    console.log('2️⃣ Testing Health Scores Endpoints...\n');
    console.log(`   Date Range: ${startDateTime} to ${endDateTime}\n`);
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing: ${endpoint.name}`);
        console.log(`   ${dataBaseURL}${endpoint.path}`);
        
        const response = await axios.get(
          `${dataBaseURL}${endpoint.path}`,
          {
            headers: {
              'Authorization': `account ${token}`
            },
            validateStatus: () => true // Don't throw on any status
          }
        );

        if (response.status === 200) {
          console.log(`   ✅ SUCCESS! Status: ${response.status}`);
          console.log('   📊 Data:');
          const data = response.data?.data || response.data || response.data?.scores || response.data;
          if (Array.isArray(data)) {
            console.log(`   Found ${data.length} score(s):`);
            data.forEach((score, idx) => {
              console.log(`   [${idx + 1}] Type: ${score.type || score.Type}, Score: ${score.score || score.Score}, State: ${score.state || score.State}`);
            });
          } else {
            console.log(JSON.stringify(data, null, 2));
          }
          console.log('\n   🎉 This endpoint works! Use this format.\n');
          break; // Found working endpoint
        } else if (response.status === 204) {
          console.log(`   ⚠️  Status: 204 No Content (endpoint exists but no data)\n`);
        } else {
          console.log(`   ❌ Status: ${response.status}`);
          if (response.data) {
            console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
          }
          console.log('');
        }
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ Status: ${error.response.status}`);
          if (error.response.data) {
            console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
          }
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
      }
    }

    // First, try to get profile info to see the actual profile ID
    console.log('3️⃣ Testing Profile Info Endpoint...\n');
    try {
      const profileInfoEndpoints = [
        `/api/v1/profiles/${SAMPLE_PROFILE_ID}`,
        `/api/v1/profile/${SAMPLE_PROFILE_ID}`,
        `/api/v1/account/profile/${SAMPLE_PROFILE_ID}`,
      ];
      
      for (const path of profileInfoEndpoints) {
        try {
          console.log(`   Testing: ${path}`);
          const response = await axios.get(
            `${dataBaseURL}${path}`,
            {
              headers: {
                'Authorization': `account ${token}`
              },
              validateStatus: () => true
            }
          );
          
          if (response.status === 200) {
            console.log(`   ✅ SUCCESS! Got profile info`);
            console.log('   📊 Profile Data:');
            const profileData = response.data;
            console.log(JSON.stringify(profileData, null, 2));
            
            // Extract actual profile ID if available
            if (profileData.profileId) {
              console.log(`\n   🔑 Actual Profile ID: ${profileData.profileId}`);
              console.log(`   📅 Data last received: ${profileData.dataLastReceivedAtUtc || 'N/A'}`);
              
              // Now test scores with actual profile ID
              console.log('\n   🧪 Testing scores with actual profile ID...');
              const actualProfileId = profileData.profileId;
              
              // Try today's date (since data was received recently)
              const today = new Date();
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const todayEnd = new Date(today);
              
              const scoreEndpoints = [
                {
                  name: 'With actual profile ID (today)',
                  path: `/api/v1/profile/score/${actualProfileId}?types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${todayStart.toISOString()}&endDateTime=${todayEnd.toISOString()}`
                },
                {
                  name: 'With external ID (today)',
                  path: `/api/v1/profile/score/${SAMPLE_PROFILE_ID}?types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${todayStart.toISOString()}&endDateTime=${todayEnd.toISOString()}`
                },
                {
                  name: 'With actual profile ID (last 30 days)',
                  path: `/api/v1/profile/score/${actualProfileId}?types=wellbeing,activity,readiness,mental_wellbeing&startDateTime=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&endDateTime=${new Date().toISOString()}`
                }
              ];
              
              for (const endpoint of scoreEndpoints) {
                try {
                  const scoreResponse = await axios.get(
                    `${dataBaseURL}${endpoint.path}`,
                    {
                      headers: {
                        'Authorization': `account ${token}`
                      },
                      validateStatus: () => true
                    }
                  );
                  
                  if (scoreResponse.status === 200) {
                    const scores = scoreResponse.data?.data || scoreResponse.data || [];
                    console.log(`   ✅ ${endpoint.name}: Found ${Array.isArray(scores) ? scores.length : 'N/A'} score(s)`);
                    if (Array.isArray(scores) && scores.length > 0) {
                      scores.forEach((score, idx) => {
                        console.log(`      [${idx + 1}] ${score.type}: ${score.score} (${score.state})`);
                      });
                    } else if (scores && typeof scores === 'object') {
                      console.log('      Data:', JSON.stringify(scores, null, 2));
                    }
                  }
                } catch (error) {
                  // Ignore errors for these tests
                }
              }
              
              // Test trends/comparisons with actual profile ID
              console.log('\n   🧪 Testing insights with actual profile ID...');
              const insightsTests = [
                { name: 'Trends', path: `/api/v1/profiles/${actualProfileId}/trends` },
                { name: 'Comparisons', path: `/api/v1/profiles/${actualProfileId}/comparisons` },
              ];
              
              for (const test of insightsTests) {
                try {
                  const insightsResponse = await axios.get(
                    `${dataBaseURL}${test.path}`,
                    {
                      headers: {
                        'Authorization': `account ${token}`
                      },
                      validateStatus: () => true
                    }
                  );
                  
                  if (insightsResponse.status === 200) {
                    const data = insightsResponse.data?.data || insightsResponse.data || [];
                    console.log(`   ✅ ${test.name}: Found ${Array.isArray(data) ? data.length : 'N/A'} items`);
                  } else {
                    console.log(`   ⚠️  ${test.name}: Status ${insightsResponse.status}`);
                  }
                } catch (error) {
                  // Ignore
                }
              }
            }
            
            console.log('');
            break;
          } else {
            console.log(`   ⚠️  Status: ${response.status}\n`);
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.log(`   ❌ Status: ${error.response?.status || error.message}\n`);
          }
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not fetch profile info\n');
    }

    console.log('4️⃣ Testing Insights Endpoints...\n');
    
    // Test insights with date range
    const insightsEndpoints = [
      { name: 'Trends (with date range)', path: `/api/v1/profiles/${SAMPLE_PROFILE_ID}/trends?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}` },
      { name: 'Trends (no date range)', path: `/api/v1/profiles/${SAMPLE_PROFILE_ID}/trends` },
      { name: 'Comparisons (with date range)', path: `/api/v1/profiles/${SAMPLE_PROFILE_ID}/comparisons?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}` },
      { name: 'Comparisons (no date range)', path: `/api/v1/profiles/${SAMPLE_PROFILE_ID}/comparisons` },
    ];

    for (const endpoint of insightsEndpoints) {
      try {
        console.log(`   Testing: ${endpoint.name}`);
        console.log(`   ${dataBaseURL}${endpoint.path}`);
        
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
          console.log(`   ✅ SUCCESS! Status: ${response.status}`);
          const data = response.data?.data || response.data || [];
          console.log(`   📊 Found ${Array.isArray(data) ? data.length : 'N/A'} items`);
          if (Array.isArray(data) && data.length > 0) {
            console.log('   Sample item:');
            console.log(JSON.stringify(data[0], null, 2));
          } else if (data && typeof data === 'object') {
            console.log('   Data structure:');
            console.log(JSON.stringify(data, null, 2));
          }
        } else {
          console.log(`   ⚠️  Status: ${response.status}`);
          if (response.data) {
            console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
          }
        }
        console.log('');
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ Status: ${error.response.status}`);
          if (error.response.data) {
            console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
          }
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
      }
    }

    console.log('='.repeat(60));
    console.log('✅ Direct API test completed!\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testDirectSahhaAPI();
