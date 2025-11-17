require('dotenv').config();
const sahhaService = require('./services/sahhaService');

async function testProfileCreation() {
  console.log('🧪 Testing Profile Creation\n');
  console.log('='.repeat(60) + '\n');

  try {
    // First verify account token works
    console.log('1️⃣ Getting account token...');
    const accountToken = await sahhaService.getAccountToken();
    console.log('✅ Account token obtained:', accountToken.substring(0, 50) + '...\n');

    // Test profile creation
    console.log('2️⃣ Creating test profile...');
    const testExternalId = `test-${Date.now()}`;
    console.log(`   External ID: ${testExternalId}`);
    
    const profile = await sahhaService.createProfile({
      externalId: testExternalId,
      Age: 25,
      Bodyweight_in_pounds: 165,
      Height_in_inches: 70,
      SexAtBirth: 'Male'
    });
    
    console.log('\n✅✅✅ Profile created successfully! ✅✅✅');
    console.log('Profile ID:', profile.id || profile.profile_id);
    console.log('Profile Token:', profile.token || profile.profile_token);
    console.log('\nFull Response:');
    console.log(JSON.stringify(profile, null, 2));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testProfileCreation();

