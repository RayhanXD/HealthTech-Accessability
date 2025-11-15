require('dotenv').config();
const axios = require('axios');

async function testApplicationCredentials() {
  console.log('🧪 Testing with Application ID/Secret instead of Client ID/Secret\n');
  console.log('='.repeat(60) + '\n');

  // Check if Application credentials are set
  const applicationId = process.env.SAHHA_APPLICATION_ID || process.env.SAHHA_APP_ID;
  const applicationSecret = process.env.SAHHA_APPLICATION_SECRET || process.env.SAHHA_APP_SECRET;
  const clientId = process.env.SAHHA_CLIENT_ID;
  const clientSecret = process.env.SAHHA_CLIENT_SECRET;

  console.log('📋 Available Credentials:');
  console.log(`   Application ID: ${applicationId ? `${applicationId.substring(0, 15)}...` : '❌ NOT SET'}`);
  console.log(`   Application Secret: ${applicationSecret ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`   Client ID: ${clientId ? `${clientId.substring(0, 15)}...` : '❌ NOT SET'}`);
  console.log(`   Client Secret: ${clientSecret ? '✅ Set' : '❌ NOT SET'}`);
  console.log('');

  if (!applicationId || !applicationSecret) {
    console.log('⚠️  Application credentials not found in .env');
    console.log('   Add these to your .env file:');
    console.log('   SAHHA_APPLICATION_ID=your_application_id');
    console.log('   SAHHA_APPLICATION_SECRET=your_application_secret');
    console.log('');
    console.log('   Or copy them from the Sahha Dashboard:');
    console.log('   Dashboard → API Keys → Application ID & secret');
    console.log('');
  }

  // Test with Application credentials if available
  if (applicationId && applicationSecret) {
    console.log('🔄 Testing authentication with Application ID/Secret...\n');
    
    const strategies = [
      {
        name: 'Standard with X-Environment',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'sandbox'
        }
      },
      {
        name: 'Without X-Environment',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Production environment',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment': 'production'
        }
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Testing: ${strategy.name}...`);
        const response = await axios.post(
          'https://app.sahha.ai/api/v1/oauth/account/token',
          {
            clientId: applicationId,
            clientSecret: applicationSecret
          },
          {
            headers: strategy.headers,
            validateStatus: () => true
          }
        );

        if (response.status === 200 && response.data?.accountToken) {
          console.log('✅ SUCCESS with Application credentials!');
          console.log(`   Token: ${response.data.accountToken.substring(0, 30)}...`);
          console.log(`\n💡 Solution: Use Application ID/Secret instead of Client ID/Secret`);
          console.log(`   Update your .env file:`);
          console.log(`   SAHHA_CLIENT_ID=${applicationId}`);
          console.log(`   SAHHA_CLIENT_SECRET=${applicationSecret}`);
          return;
        } else {
          console.log(`   ❌ Failed: ${response.status} - ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      console.log('');
    }
  }

  // Also test if maybe we should use appId/appSecret naming
  if (applicationId && applicationSecret) {
    console.log('🔄 Testing with appId/appSecret naming...\n');
    try {
      const response = await axios.post(
        'https://app.sahha.ai/api/v1/oauth/account/token',
        {
          appId: applicationId,
          appSecret: applicationSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Environment': 'sandbox'
          },
          validateStatus: () => true
        }
      );

      if (response.status === 200 && response.data?.accountToken) {
        console.log('✅ SUCCESS with appId/appSecret naming!');
        console.log(`   Token: ${response.data.accountToken.substring(0, 30)}...`);
        return;
      } else {
        console.log(`   ❌ Failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n📝 Summary:');
  console.log('   - Application ID/Secret: For SDK profile creation');
  console.log('   - Client ID/Secret: For backend API account tokens');
  console.log('');
  console.log('   If Application credentials work, you may need to use them for backend too.');
  console.log('   Or the 500 errors might indicate a different issue (account status, etc.)');
}

testApplicationCredentials();

