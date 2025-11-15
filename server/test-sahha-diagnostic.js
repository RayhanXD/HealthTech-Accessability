require('dotenv').config();
const axios = require('axios');

async function diagnosticTest() {
  console.log('🔍 Sahha Authentication Diagnostic Test\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';

  console.log('📋 Configuration Check:');
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ MISSING'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   Environment: ${environment}`);
  console.log('');

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials in .env file!');
    process.exit(1);
  }

  // Test different base URLs
  const baseUrls = [
    'https://app.sahha.ai',
    'https://sandbox-api.sahha.ai',
    'https://api.sahha.ai',
    'https://test.sahha.ai',
  ];

  const endpoints = [
    '/api/v1/oauth/account/token',
    '/oauth/account/token',
    '/v1/oauth/account/token',
  ];

  const headerVariations = [
    { name: 'Standard', headers: { 'Content-Type': 'application/json', 'X-Environment': environment } },
    { name: 'Capitalized Env', headers: { 'Content-Type': 'application/json', 'X-Environment': environment.charAt(0).toUpperCase() + environment.slice(1) } },
    { name: 'No X-Environment', headers: { 'Content-Type': 'application/json' } },
    { name: 'With Accept', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Environment': environment } },
  ];

  let successFound = false;

  for (const baseUrl of baseUrls) {
    for (const endpoint of endpoints) {
      const fullUrl = `${baseUrl}${endpoint}`;
      
      for (const headerVar of headerVariations) {
        try {
          console.log(`🧪 Testing: ${baseUrl}${endpoint}`);
          console.log(`   Headers: ${headerVar.name}`);
          
          const response = await axios.post(
            fullUrl,
            {
              clientId: clientId,
              clientSecret: clientSecret
            },
            {
              headers: headerVar.headers,
              validateStatus: () => true, // Don't throw on any status
              timeout: 10000
            }
          );

          console.log(`   Status: ${response.status}`);
          
          if (response.status === 200) {
            console.log('   ✅ SUCCESS!');
            console.log(`   Response:`, JSON.stringify(response.data, null, 2));
            successFound = true;
            console.log('\n🎉 Working configuration found!');
            console.log(`   Base URL: ${baseUrl}`);
            console.log(`   Endpoint: ${endpoint}`);
            console.log(`   Headers: ${JSON.stringify(headerVar.headers, null, 2)}`);
            return;
          } else if (response.status === 400) {
            console.log(`   ⚠️  400 Bad Request: ${JSON.stringify(response.data)}`);
          } else if (response.status === 401) {
            console.log(`   ⚠️  401 Unauthorized: ${JSON.stringify(response.data)}`);
          } else if (response.status === 500) {
            console.log(`   ❌ 500 Internal Error: ${JSON.stringify(response.data)}`);
            if (response.data?.message) {
              console.log(`   Error message: ${response.data.message}`);
            }
          } else {
            console.log(`   ⚠️  Status ${response.status}: ${JSON.stringify(response.data)}`);
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log(`   ❌ Connection failed: ${error.message}`);
          } else if (error.response) {
            console.log(`   ❌ Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          } else {
            console.log(`   ❌ Error: ${error.message}`);
          }
        }
        console.log('');
      }
    }
  }

  if (!successFound) {
    console.log('='.repeat(60));
    console.log('❌ No working configuration found\n');
    console.log('📝 Diagnostic Summary:');
    console.log('   All authentication attempts failed with 500 errors.');
    console.log('   This suggests an issue with:');
    console.log('   1. Credentials may not be activated in Sahha Dashboard');
    console.log('   2. Credentials may be for a different environment');
    console.log('   3. Account may need activation or approval');
    console.log('   4. Sahha API may have a temporary issue\n');
    console.log('💡 Next Steps:');
    console.log('   1. Log in to Sahha Dashboard:');
    console.log('      - Sandbox: https://test.sahha.ai');
    console.log('      - Production: https://app.sahha.ai');
    console.log('   2. Verify your credentials:');
    console.log(`      - Client ID starts with: ${clientId.substring(0, 10)}...`);
    console.log('      - Check if credentials are marked as "Active"');
    console.log('      - Look for any activation steps or warnings');
    console.log('   3. Check if credentials are for the correct environment');
    console.log('   4. Contact Sahha Support:');
    console.log('      - Email: support@sahha.ai');
    console.log('      - Provide this information:');
    console.log(`        * Client ID: ${clientId.substring(0, 10)}...`);
    console.log(`        * Environment: ${environment}`);
    console.log('        * Error: 500 Internal Server Error');
    console.log('        * Endpoint: /api/v1/oauth/account/token');
    console.log('        * All header variations tested');
    console.log('        * All base URL variations tested');
  }
}

diagnosticTest().catch(console.error);

