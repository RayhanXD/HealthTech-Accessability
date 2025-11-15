require('dotenv').config();
const axios = require('axios');

async function testBothCredentials() {
  console.log('🧪 Testing Both Application and Client Credentials\n');
  console.log('='.repeat(60) + '\n');

  // Get Application credentials (try different env var names)
  const appId = process.env.SAHHA_APPLICATION_ID || 
                process.env.SAHHA_APP_ID || 
                process.env.SAHHA_APPLICATION_ID;
  const appSecret = process.env.SAHHA_APPLICATION_SECRET || 
                    process.env.SAHHA_APP_SECRET || 
                    process.env.SAHHA_APPLICATION_SECRET;

  // Get Client credentials
  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;

  console.log('📋 Credentials Status:');
  console.log(`   Application ID: ${appId ? `${appId.substring(0, 15)}...` : '❌ NOT SET'}`);
  console.log(`   Application Secret: ${appSecret ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ NOT SET'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ NOT SET'}`);
  console.log('');

  const endpoint = 'https://app.sahha.ai/api/v1/oauth/account/token';
  const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';

  // Test 1: Try Application credentials as clientId/clientSecret
  if (appId && appSecret) {
    console.log('🔄 Test 1: Using Application ID/Secret as clientId/clientSecret...\n');
    try {
      const response = await axios.post(
        endpoint,
        {
          clientId: appId,
          clientSecret: appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': environment
          },
          validateStatus: () => true
        }
      );

      if (response.status === 200 && response.data?.accountToken) {
        console.log('✅ SUCCESS! Application credentials work for account token!');
        console.log(`   Token: ${response.data.accountToken.substring(0, 30)}...`);
        console.log('\n💡 SOLUTION: Use Application ID/Secret in your backend');
        console.log('   Update your .env:');
        console.log(`   SAHHA_CLIENT_ID=${appId}`);
        console.log(`   SAHHA_CLIENT_SECRET=${appSecret}`);
        return true;
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Test 2: Try Application credentials as appId/appSecret
  if (appId && appSecret) {
    console.log('🔄 Test 2: Using Application ID/Secret as appId/appSecret...\n');
    try {
      const response = await axios.post(
        endpoint,
        {
          appId: appId,
          appSecret: appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': environment
          },
          validateStatus: () => true
        }
      );

      if (response.status === 200 && response.data?.accountToken) {
        console.log('✅ SUCCESS! Application credentials work with appId/appSecret!');
        console.log(`   Token: ${response.data.accountToken.substring(0, 30)}...`);
        return true;
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  // Test 3: Try Client credentials (current setup)
  if (clientId && clientSecret) {
    console.log('🔄 Test 3: Using Client ID/Secret (current setup)...\n');
    try {
      const response = await axios.post(
        endpoint,
        {
          clientId: clientId,
          clientSecret: clientSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': environment
          },
          validateStatus: () => true
        }
      );

      if (response.status === 200 && response.data?.accountToken) {
        console.log('✅ SUCCESS! Client credentials work!');
        console.log(`   Token: ${response.data.accountToken.substring(0, 30)}...`);
        return true;
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }

  console.log('📝 Next Steps:');
  if (!appId || !appSecret) {
    console.log('   1. Copy Application ID and Application Secret from Sahha Dashboard');
    console.log('   2. Add to your .env file:');
    console.log('      SAHHA_APPLICATION_ID=your_application_id');
    console.log('      SAHHA_APPLICATION_SECRET=your_application_secret');
    console.log('   3. Run this test again');
  } else {
    console.log('   All credential types tested. If all failed with 500 errors,');
    console.log('   this suggests an account-level issue. Contact Sahha support.');
  }
}

testBothCredentials();

