require('dotenv').config();
const axios = require('axios');

async function testAllAuthMethods() {
  console.log('🧪 Testing ALL Authentication Methods\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials!');
    process.exit(1);
  }

  const strategies = [
    // Basic Auth
    {
      name: 'Basic Auth (base64 encoded)',
      endpoint: 'https://app.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'X-Environment': 'sandbox'
      },
      body: {}
    },
    {
      name: 'Basic Auth (no X-Environment)',
      endpoint: 'https://app.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: {}
    },
    // Headers with different names
    {
      name: 'Credentials in x-client-id/x-client-secret headers',
      endpoint: 'https://app.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json',
        'X-Environment': 'sandbox'
      },
      body: {}
    },
    // Different endpoints
    {
      name: 'Different endpoint: /oauth/token',
      endpoint: 'https://app.sahha.ai/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': 'sandbox'
      },
      body: { clientId, clientSecret }
    },
    {
      name: 'Different endpoint: /v1/oauth/account/token',
      endpoint: 'https://app.sahha.ai/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': 'sandbox'
      },
      body: { clientId, clientSecret }
    },
    // Try sandbox-api instead of app
    {
      name: 'Using sandbox-api.sahha.ai',
      endpoint: 'https://sandbox-api.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': 'sandbox'
      },
      body: { clientId, clientSecret }
    },
    // Try production
    {
      name: 'Production environment',
      endpoint: 'https://app.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': 'production'
      },
      body: { clientId, clientSecret }
    },
    // Form data
    {
      name: 'Form data (application/x-www-form-urlencoded)',
      endpoint: 'https://app.sahha.ai/api/v1/oauth/account/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Environment': 'sandbox'
      },
      body: new URLSearchParams({
        clientId: clientId,
        clientSecret: clientSecret
      }).toString()
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    try {
      console.log(`\n${i + 1}. ${strategy.name}`);
      console.log(`   Endpoint: ${strategy.endpoint}`);
      
      const config = {
        method: strategy.method,
        url: strategy.endpoint,
        headers: strategy.headers,
        data: strategy.body,
        validateStatus: () => true
      };

      const response = await axios(config);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        const token = response.data?.accountToken || 
                     response.data?.token || 
                     response.data?.access_token ||
                     response.data?.accessToken;
        
        if (token) {
          console.log(`\n✅✅✅ SUCCESS with: ${strategy.name} ✅✅✅`);
          console.log(`   Token: ${token.substring(0, 50)}...`);
          console.log(`   Full Response:`, JSON.stringify(response.data, null, 2));
          console.log(`\n💡 Use this token in API calls with:`);
          console.log(`   Authorization: Bearer ${token.substring(0, 20)}...`);
          console.log(`   OR`);
          console.log(`   Authorization: account ${token.substring(0, 20)}...`);
          return;
        } else {
          console.log(`   ⚠️  Got 200 but no token found`);
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        }
      } else if (response.status === 400) {
        console.log(`   ❌ 400 Bad Request`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      } else if (response.status === 401) {
        console.log(`   ❌ 401 Unauthorized`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      } else if (response.status === 500) {
        console.log(`   ❌ 500 Internal Error`);
      } else {
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ All authentication methods failed');
  console.log('\n💡 Possible issues:');
  console.log('   1. Credentials are incorrect');
  console.log('   2. Credentials are for a different environment');
  console.log('   3. API endpoint has changed');
  console.log('   4. Need to contact Sahha support');
}

testAllAuthMethods();

