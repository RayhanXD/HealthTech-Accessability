require('dotenv').config();
const axios = require('axios');

async function testDirect() {
  console.log('🧪 Testing Sahha API with Direct Request\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';

  console.log('📋 Configuration:');
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ MISSING'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   Environment: ${environment}`);
  console.log('');

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
  }

  // Try the exact format from Sahha docs
  const endpoint = 'https://app.sahha.ai/api/v1/oauth/account/token';
  
  console.log('🔄 Testing authentication request...\n');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Method: POST`);
  console.log(`   Body: { clientId, clientSecret }`);
  console.log(`   Headers: Content-Type: application/json, X-Environment: ${environment}`);
  console.log('');

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
        validateStatus: () => true, // Don't throw on any status
        timeout: 10000
      }
    );

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, JSON.stringify(response.headers, null, 2));
    console.log(`📊 Response Data:`, JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.status === 200 && response.data?.accountToken) {
      console.log('✅ SUCCESS! Authentication worked!');
      console.log(`   Account Token: ${response.data.accountToken.substring(0, 30)}...`);
      return true;
    } else {
      console.log('❌ Authentication failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      
      if (response.status === 500) {
        console.log('\n💡 500 Error indicates:');
        console.log('   - Request reached Sahha server');
        console.log('   - Server-side error (not your code)');
        console.log('   - Possible causes:');
        console.log('     • Account needs support activation');
        console.log('     • Trial account limitations');
        console.log('     • Server-side bug');
        console.log('\n📧 Contact Sahha support: support@sahha.ai');
        console.log('   Mention: "Getting 500 errors on account token endpoint"');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

testDirect();

