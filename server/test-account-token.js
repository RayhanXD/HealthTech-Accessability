require('dotenv').config();
const axios = require('axios');

async function testAccountToken() {
  console.log('🧪 Testing Account Token Generation and Usage\n');
  console.log('='.repeat(60) + '\n');

  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;
  const environment = process.env.SAHHA_ENVIRONMENT || 'sandbox';
  const authBaseURL = process.env.SAHHA_AUTH_BASE_URL || 'https://app.sahha.ai';
  const dataBaseURL = process.env.SAHHA_API_BASE_URL || 'https://sandbox-api.sahha.ai';

  // Check credentials
  console.log('📋 Configuration:');
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ MISSING'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ MISSING'}`);
  console.log(`   Environment: ${environment}`);
  console.log(`   Auth URL: ${authBaseURL}`);
  console.log(`   Data URL: ${dataBaseURL}\n`);

  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials!');
    console.error('   Please set SAHHA_CLIENT_ID and SAHHA_CLIENT_SECRET in .env');
    process.exit(1);
  }

  // Step 1: Generate Account Token - Try Multiple Strategies
  console.log('1️⃣ Generating Account Token...\n');
  let accountToken = null;

  // Try different authentication strategies
  const authStrategies = [
    {
      name: 'Standard (camelCase body, X-Environment header)',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 'Content-Type': 'application/json', 'X-Environment': environment }
    },
    {
      name: 'Without X-Environment header',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'snake_case body format',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { client_id: clientId, client_secret: clientSecret },
      headers: { 'Content-Type': 'application/json', 'X-Environment': environment }
    },
    {
      name: 'Capitalized X-Environment',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 'Content-Type': 'application/json', 'X-Environment': 'Sandbox' }
    },
    {
      name: 'Production environment',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 'Content-Type': 'application/json', 'X-Environment': 'production' }
    },
    {
      name: 'Alternative endpoint (v1 without /api)',
      endpoint: `${authBaseURL}/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 'Content-Type': 'application/json', 'X-Environment': environment }
    },
    {
      name: 'With Accept header',
      endpoint: `${authBaseURL}/api/v1/oauth/account/token`,
      body: { clientId, clientSecret },
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json',
        'X-Environment': environment 
      }
    }
  ];

  let success = false;
  for (let i = 0; i < authStrategies.length; i++) {
    const strategy = authStrategies[i];
    try {
      console.log(`   Trying Strategy ${i + 1}: ${strategy.name}`);
      console.log(`   Endpoint: ${strategy.endpoint}`);
      
      const response = await axios.post(
        strategy.endpoint,
        strategy.body,
        {
          headers: strategy.headers,
          validateStatus: () => true // Don't throw on any status
        }
      );

      console.log(`   Status: ${response.status}`);

      if (response.status === 200 && response.data) {
        // Try different possible response formats
        accountToken = response.data.accountToken || 
                       response.data.token || 
                       response.data.access_token ||
                       response.data.accessToken;

        if (accountToken) {
          console.log(`\n✅ SUCCESS with Strategy ${i + 1}: ${strategy.name}`);
          console.log(`   Token: ${accountToken.substring(0, 50)}...`);
          console.log(`   Token Length: ${accountToken.length} characters`);
          console.log(`   Full Response:`, JSON.stringify(response.data, null, 2));
          console.log('');
          success = true;
          break;
        } else {
          console.log(`   ⚠️  Got 200 but no token in response`);
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        }
      } else if (response.status === 400) {
        console.log(`   ❌ 400 Bad Request - Check credentials format`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      } else if (response.status === 401) {
        console.log(`   ❌ 401 Unauthorized - Invalid credentials`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      } else if (response.status === 500) {
        console.log(`   ❌ 500 Internal Error - Server issue (trying next strategy...)`);
        if (i === authStrategies.length - 1) {
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        }
      } else {
        console.log(`   Response:`, JSON.stringify(response.data, null, 2));
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
      }
      console.log('');
    }
  }

  if (!success) {
    console.error('\n❌ All authentication strategies failed');
    console.error('\n💡 This 500 error typically means:');
    console.error('   1. Credentials may not be activated for API access');
    console.error('      → Log into https://test.sahha.ai and check API settings');
    console.error('   2. Credentials might need approval from Sahha support');
    console.error('      → Contact support@sahha.ai');
    console.error('   3. Wrong environment (sandbox vs production)');
    console.error('      → Verify in Sahha Dashboard which environment your credentials are for');
    console.error('   4. API access might require additional setup');
    console.error('      → Check Sahha documentation for activation steps');
    console.error('\n📝 Next Steps:');
    console.error('   1. Verify credentials in Sahha Dashboard');
    console.error('   2. Check if there\'s an "Activate API Access" button');
    console.error('   3. Contact Sahha support with your Client ID');
    process.exit(1);
  }

  // Step 2: Test using token in API call
  console.log('2️⃣ Testing Account Token in API Call...\n');
  
  try {
    // Try to list profiles or get account info
    const testEndpoints = [
      `${dataBaseURL}/api/v1/account/profiles`,
      `${dataBaseURL}/api/v1/profiles`,
      `${dataBaseURL}/v1/account/profiles`
    ];

    let success = false;
    for (const endpoint of testEndpoints) {
      try {
        console.log(`   Trying: GET ${endpoint}`);
        console.log(`   Authorization: account ${accountToken.substring(0, 20)}...`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `account ${accountToken}`,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true // Don't throw on any status
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          console.log('✅ Token works! API call successful');
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
          success = true;
          break;
        } else if (response.status === 401) {
          console.log('   ⚠️  401 Unauthorized - Token might be invalid or expired');
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        } else if (response.status === 404) {
          console.log('   ℹ️  404 - Endpoint not found (trying next...)');
        } else {
          console.log(`   Response:`, JSON.stringify(response.data, null, 2));
        }
        console.log('');
      } catch (error) {
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }

    if (!success) {
      console.log('⚠️  Could not verify token with API call, but token was generated successfully');
      console.log('   This might be normal if the endpoint requires a profile ID');
    }

  } catch (error) {
    console.error('⚠️  Error testing token:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📝 Summary:\n');
  if (accountToken) {
    console.log('✅ Account token generation: WORKING');
    console.log(`   Token: ${accountToken.substring(0, 30)}...`);
    console.log('\n💡 Use this token in API calls with:');
    console.log(`   Authorization: account ${accountToken.substring(0, 20)}...`);
    console.log('\n📚 Example API call:');
    console.log(`   curl -X GET "${dataBaseURL}/api/v1/profiles" \\`);
    console.log(`     -H "Authorization: account ${accountToken.substring(0, 20)}..."`);
    console.log('\n✅ Your code in sahhaService.js already uses this format!');
    console.log('   All API calls will automatically use: Authorization: account {token}');
  }
  console.log('');
}

testAccountToken();

