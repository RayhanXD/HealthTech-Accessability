require('dotenv').config();
const axios = require('axios');

async function testEndpoints() {
  const appId = process.env.SAHHA_APPLICATION_ID;
  const appSecret = process.env.SAHHA_APPLICATION_SECRET;
  const testUserId = `test-${Date.now()}`;

  console.log('🧪 Testing Various Sahha Endpoints\n');
  console.log('='.repeat(60) + '\n');

  const endpoints = [
    // Profile registration endpoints
    { url: 'https://sandbox-api.sahha.ai/api/v1/profiles', method: 'POST', body: { external_id: testUserId } },
    { url: 'https://sandbox-api.sahha.ai/v1/profiles', method: 'POST', body: { external_id: testUserId } },
    
    // Token endpoints
    { url: 'https://sandbox-api.sahha.ai/api/v1/user/token', method: 'POST', body: { external_id: testUserId } },
    { url: 'https://sandbox-api.sahha.ai/v1/user/token', method: 'POST', body: { external_id: testUserId } },
    { url: 'https://api.sahha.ai/v1/user/token', method: 'POST', body: { external_id: testUserId } },
    
    // OAuth token endpoints
    { url: 'https://sandbox-api.sahha.ai/api/v1/oauth/profile/token', method: 'POST', body: { externalId: testUserId } },
    { url: 'https://sandbox-api.sahha.ai/v1/oauth/profile/token', method: 'POST', body: { externalId: testUserId } },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.method} ${endpoint.url}`);
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        data: endpoint.body,
        headers: {
          'x-app-id': appId,
          'x-app-secret': appSecret,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true,
        timeout: 5000
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ SUCCESS! Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
        console.log('');
        return; // Found working endpoint
      } else if (response.status !== 404) {
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      } else {
        console.log(`   ❌ 404 Not Found`);
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.log(`   Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (!error.response) {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('❌ No working endpoint found. The guide endpoint might be incorrect or outdated.');
}

testEndpoints();




