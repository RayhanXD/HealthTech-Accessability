require('dotenv').config();
const axios = require('axios');

async function testAuth() {
  console.log('Testing Sahha Authentication...\n');
  
  // Test 1: Client credentials in body
  console.log('Test 1: Client credentials in body (camelCase)');
  try {
    const response = await axios.post(
      'https://app.sahha.ai/api/v1/oauth/account/token',
      {
        clientId: process.env.SAHHA_CLIENT_ID,
        clientSecret: process.env.SAHHA_CLIENT_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'sandbox'
        }
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('');
  }
  
  // Test 2: Try without X-Environment header
  console.log('Test 2: Without X-Environment header');
  try {
    const response = await axios.post(
      'https://app.sahha.ai/api/v1/oauth/account/token',
      {
        clientId: process.env.SAHHA_CLIENT_ID,
        clientSecret: process.env.SAHHA_CLIENT_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return;
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('');
  }
  
  console.log('\n⚠️ All tests failed. This suggests:');
  console.log('1. Credentials may not be activated for API access');
  console.log('2. Sandbox may require dashboard login/session');
  console.log('3. Contact Sahha support: support@sahha.ai');
}

testAuth();
