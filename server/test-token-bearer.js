require('dotenv').config();
const axios = require('axios');

async function testTokenBearer() {
  console.log('🧪 Testing Account Token with Bearer Format\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';
  const authBaseURL = process.env.SAHHA_AUTH_BASE_URL || 'https://app.sahha.ai';
  const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';

  console.log('📋 Configuration:');
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ MISSING'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   Environment: ${environment}\n`);

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials!');
    process.exit(1);
  }

  // Try credentials in HEADERS instead of body
  console.log('1️⃣ Trying credentials in HEADERS (x-app-id, x-app-secret)...\n');
  
  try {
    const response = await axios.post(
      `${authBaseURL}/api/v1/oauth/account/token`,
      {}, // Empty body
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': environment,
          'x-app-id': clientId,
          'x-app-secret': clientSecret
        }
      }
    );

    if (response.status === 200 && response.data) {
      const token = response.data.accountToken || response.data.token || response.data.access_token || response.data.accessToken;
      if (token) {
        console.log('✅ SUCCESS with credentials in headers!');
        console.log(`   Token: ${token.substring(0, 50)}...`);
        console.log(`   Full Response:`, JSON.stringify(response.data, null, 2));
        console.log('\n2️⃣ Testing token with Bearer format...\n');
        
        // Test with Bearer
        try {
          const testResponse = await axios.get(
            `${dataBaseURL}/api/v1/profiles`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              validateStatus: () => true
            }
          );
          console.log(`   Status: ${testResponse.status}`);
          if (testResponse.status === 200 || testResponse.status === 401) {
            console.log('   Response:', JSON.stringify(testResponse.data, null, 2));
          }
        } catch (err) {
          console.log('   Error testing:', err.message);
        }
        
        return;
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
  }

  // Try standard body format but check for Bearer in response
  console.log('2️⃣ Trying standard body format...\n');
  
  try {
    const response = await axios.post(
      `${authBaseURL}/api/v1/oauth/account/token`,
      {
        clientId: clientId,
        clientSecret: clientSecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': environment
        }
      }
    );

    if (response.status === 200 && response.data) {
      const token = response.data.accountToken || response.data.token || response.data.access_token || response.data.accessToken;
      if (token) {
        console.log('✅ SUCCESS!');
        console.log(`   Token: ${token.substring(0, 50)}...`);
        console.log(`   Full Response:`, JSON.stringify(response.data, null, 2));
        console.log('\n3️⃣ Testing token usage...\n');
        
        // Test both Bearer and account formats
        const formats = [
          { name: 'Bearer', header: `Bearer ${token}` },
          { name: 'account', header: `account ${token}` }
        ];

        for (const format of formats) {
          try {
            console.log(`   Testing with ${format.name} format...`);
            const testResponse = await axios.get(
              `${dataBaseURL}/api/v1/profiles`,
              {
                headers: {
                  'Authorization': format.header,
                  'Content-Type': 'application/json'
                },
                validateStatus: () => true
              }
            );
            console.log(`   Status: ${testResponse.status}`);
            if (testResponse.status === 200) {
              console.log(`   ✅ ${format.name} format works!`);
              console.log(`   Response:`, JSON.stringify(testResponse.data, null, 2));
              break;
            } else if (testResponse.status === 401) {
              console.log(`   ❌ ${format.name} format: Unauthorized`);
            } else {
              console.log(`   Response:`, JSON.stringify(testResponse.data, null, 2));
            }
          } catch (err) {
            console.log(`   Error: ${err.message}`);
          }
        }
        
        return;
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
    console.log('\n💡 All attempts failed. The 500 error suggests:');
    console.log('   - Credentials might be invalid');
    console.log('   - Wrong environment (try production)');
    console.log('   - API endpoint might be different');
  }
}

testTokenBearer();

