require('dotenv').config();
const axios = require('axios');

async function testSimpleToken() {
  console.log('🧪 Simple Account Token Test (Per Documentation)\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials!');
    process.exit(1);
  }

  // Try the exact format from docs - no X-Environment header
  const endpoints = [
    'https://sandbox-api.sahha.ai/api/v1/oauth/account/token',
    'https://api.sahha.ai/api/v1/oauth/account/token',
    'https://app.sahha.ai/api/v1/oauth/account/token'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying: ${endpoint}`);
      console.log(`Body: { clientId, clientSecret }`);
      console.log(`Headers: { Content-Type: application/json }`);
      
      const response = await axios.post(
        endpoint,
        {
          clientId: clientId,
          clientSecret: clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        const token = response.data?.accountToken || 
                     response.data?.token || 
                     response.data?.access_token ||
                     response.data?.accessToken;
        
        if (token) {
          console.log(`\n✅✅✅ SUCCESS! ✅✅✅`);
          console.log(`Endpoint: ${endpoint}`);
          console.log(`Token: ${token.substring(0, 50)}...`);
          console.log(`Full Response:`, JSON.stringify(response.data, null, 2));
          console.log(`\n💡 Use this token in API calls:`);
          console.log(`   Authorization: account ${token.substring(0, 20)}...`);
          return;
        } else {
          console.log(`   ⚠️  Got 200 but no token in response`);
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        }
      } else {
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('❌ All attempts failed');
}

testSimpleToken();

