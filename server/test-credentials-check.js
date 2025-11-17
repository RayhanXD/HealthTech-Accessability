require('dotenv').config();
const axios = require('axios');

async function testCredentialsCheck() {
  console.log('🔍 Checking Credentials Type and Environment\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  const appId = process.env.SAHHA_APPLICATION_ID;
  const appSecret = process.env.SAHHA_APPLICATION_SECRET;

  console.log('📋 Available Credentials:');
  console.log(`   Client ID: ${clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Application ID: ${appId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Application Secret: ${appSecret ? '✅ Set' : '❌ Missing'}\n`);

  // Test 1: Try Client credentials on sandbox-api (got 400 before)
  console.log('1️⃣ Testing Client credentials on sandbox-api.sahha.ai...\n');
  try {
    const response = await axios.post(
      'https://sandbox-api.sahha.ai/api/v1/oauth/account/token',
      {
        clientId: clientId,
        clientSecret: clientSecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'sandbox'
        },
        validateStatus: () => true
      }
    );

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      const token = response.data?.accountToken || response.data?.token;
      if (token) {
        console.log(`\n✅✅✅ SUCCESS! Token: ${token.substring(0, 50)}...`);
        return;
      }
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 2: Try Application credentials as Client credentials
  if (appId && appSecret) {
    console.log('\n2️⃣ Testing Application credentials as Client credentials...\n');
    try {
      const response = await axios.post(
        'https://sandbox-api.sahha.ai/api/v1/oauth/account/token',
        {
          clientId: appId,
          clientSecret: appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': 'sandbox'
          },
          validateStatus: () => true
        }
      );

      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      
      if (response.status === 200) {
        const token = response.data?.accountToken || response.data?.token;
        if (token) {
          console.log(`\n✅✅✅ SUCCESS with Application credentials!`);
          console.log(`   Token: ${token.substring(0, 50)}...`);
          console.log(`\n💡 Update your .env:`);
          console.log(`   SAHHA_CLIENT_ID=${appId}`);
          console.log(`   SAHHA_CLIENT_SECRET=${appSecret}`);
          return;
        }
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }

  // Test 3: Try production environment
  console.log('\n3️⃣ Testing Client credentials on PRODUCTION...\n');
  try {
    const response = await axios.post(
      'https://app.sahha.ai/api/v1/oauth/account/token',
      {
        clientId: clientId,
        clientSecret: clientSecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'production'
        },
        validateStatus: () => true
      }
    );

    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      const token = response.data?.accountToken || response.data?.token;
      if (token) {
        console.log(`\n✅✅✅ SUCCESS on PRODUCTION!`);
        console.log(`   Token: ${token.substring(0, 50)}...`);
        console.log(`\n💡 Update your .env:`);
        console.log(`   SAHHA_ENVIRONMENT=production`);
        return;
      }
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 4: Try using sandbox-api with different endpoint
  console.log('\n4️⃣ Testing sandbox-api with /v1/oauth/account/token (no /api)...\n');
  try {
    const response = await axios.post(
      'https://sandbox-api.sahha.ai/v1/oauth/account/token',
      {
        clientId: clientId,
        clientSecret: clientSecret
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      }
    );

    console.log(`   Status: ${response.status}`);
    if (response.status === 200) {
      const token = response.data?.accountToken || response.data?.token;
      if (token) {
        console.log(`\n✅✅✅ SUCCESS!`);
        console.log(`   Token: ${token.substring(0, 50)}...`);
        return;
      }
    } else {
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ All tests failed');
  console.log('\n💡 The error "Failed to find client token" suggests:');
  console.log('   1. Credentials might be Application ID/Secret, not Client ID/Secret');
  console.log('   2. Credentials might be for production, not sandbox');
  console.log('   3. Credentials might be incorrect or expired');
  console.log('\n📝 Check your Sahha Dashboard:');
  console.log('   - Are these "Client ID/Secret" or "Application ID/Secret"?');
  console.log('   - Which environment are they for (sandbox/production)?');
}

testCredentialsCheck();

