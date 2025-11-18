require('dotenv').config();
const sahhaService = require('./services/sahhaService');

async function testUserToken() {
  console.log('🧪 Testing User Token Creation (Correct Method)\n');
  console.log('='.repeat(60) + '\n');

  const appId = process.env.SAHHA_APPLICATION_ID;
  const appSecret = process.env.SAHHA_APPLICATION_SECRET;

  console.log('📋 Configuration:');
  console.log(`   Application ID: ${appId ? `${appId.substring(0, 15)}...` : '❌ MISSING'}`);
  console.log(`   Application Secret: ${appSecret ? '✅ Set' : '❌ MISSING'}`);
  console.log('');

  if (!appId || !appSecret) {
    console.error('❌ Missing Application credentials in .env');
    console.error('   Add: SAHHA_APPLICATION_ID and SAHHA_APPLICATION_SECRET');
    process.exit(1);
  }

  const testUserId = `test-user-${Date.now()}`;
  console.log(`🔄 Testing user token creation for: ${testUserId}\n`);

  try {
    const token = await sahhaService.createUserToken(testUserId);
    
    console.log('✅ SUCCESS! User token created!');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Token length: ${token.length} characters`);
    console.log('');
    console.log('💡 This token can be used in React Native SDK:');
    console.log('   Sahha.authenticate({ token })');
    console.log('');
    console.log('📝 Test your backend endpoint:');
    console.log(`   POST http://localhost:3001/api/sahha/token`);
    console.log(`   Body: { "userId": "${testUserId}" }`);
    
  } catch (error) {
    console.error('❌ Failed to create user token:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

testUserToken();




